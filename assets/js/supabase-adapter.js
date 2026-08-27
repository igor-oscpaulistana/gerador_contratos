(() => {
  "use strict";

  const cfg = window.APP_CONFIG || {};
  const configured = cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.startsWith("COLE_AQUI") && !cfg.supabaseAnonKey.startsWith("COLE_AQUI");

  let client = null;
  let historyCache = [];

  function setLoginMessage(message){
    const el = document.getElementById("loginError");
    if(!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function clearLoginMessage(){
    document.getElementById("loginError")?.classList.add("hidden");
  }

  function mapRow(row){
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      data: row.form_data,
      documentHtml: row.document_html,
      templateVersion: row.template_version
    };
  }

  async function loadHistory(){
    const { data, error } = await client
      .from("contracts")
      .select("id, document_type, company_name, cnpj, form_data, document_html, template_version, created_at, updated_at")
      .order("created_at", { ascending:false });
    if(error) throw error;
    historyCache = (data || []).map(mapRow);
    window.renderHistory();
  }

  window.supabaseGetHistory = function(){
    return historyCache;
  };

  window.supabaseLogin = async function(){
    if(!configured){
      setLoginMessage("Configure a URL e a chave pública do Supabase em assets/js/config.js.");
      return;
    }
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    clearLoginMessage();
    if(!client){
      setLoginMessage("O Supabase não foi inicializado. Atualize a página com Ctrl+F5.");
      return;
    }

    try{
      const { data, error } = await client.auth.signInWithPassword({ email, password });

      if(error){
        console.error("Supabase login error:", error);
        const msg = String(error.message || "");
        const lower = msg.toLowerCase();

        if(lower.includes("invalid login credentials")){
          setLoginMessage("E-mail ou senha inválidos no Supabase.");
        }else if(lower.includes("email not confirmed")){
          setLoginMessage("O e-mail ainda não está confirmado no Supabase.");
        }else if(lower.includes("invalid api key") || lower.includes("apikey")){
          setLoginMessage("A chave pública configurada no site não foi aceita pelo Supabase.");
        }else{
          setLoginMessage("Falha no login do Supabase: " + msg);
        }
        return;
      }

      if(!data?.session){
        setLoginMessage("Login aceito, mas o Supabase não retornou uma sessão válida.");
        return;
      }

      window.CURRENT_SUPABASE_USER = data.session.user;
      window.updatePrintPaginationStyle?.();
      await loadHistory();
      window.showApp();
    }catch(err){
      console.error("Unexpected Supabase login error:", err);
      setLoginMessage("Erro ao conectar ao Supabase: " + (err?.message || String(err)));
    }
  };

  window.supabaseLogout = async function(){
    if(client) await client.auth.signOut();
    historyCache = [];
    window.CURRENT_SUPABASE_USER = null;
    document.getElementById("appTopbar").classList.add("hidden");
    document.getElementById("appMain").classList.add("hidden");
    document.getElementById("loginView").classList.remove("hidden");
    document.getElementById("loginPassword").value = "";
    window.closeModal();
  };

  window.supabaseSaveContract = async function(){
    const issues = contractMode === "ALTERACAO" ? validateAlteracao() : validateAll();
    if(issues.length){
      alert("Revise os campos obrigatórios.");
      return;
    }

    if(contractMode === "CONSTITUICAO") formData.tipoDocumento = "CONSTITUICAO";
    const normalized = normalizeData(JSON.parse(JSON.stringify(formData)));
    const snapshot = contractHtml(normalized);
    const currentSession = (await client.auth.getSession()).data.session;
    if(!currentSession){
      setLoginMessage("Sua sessão expirou. Entre novamente.");
      return;
    }

    const existing = editingId ? historyCache.find(x => x.id === editingId) : null;
    const payload = {
      user_id: currentSession.user.id,
      document_type: normalized.tipoDocumento || "CONSTITUICAO",
      company_name: normalized.empresa?.razaoSocial || "",
      cnpj: normalized.empresa?.cnpj || null,
      form_data: normalized,
      document_html: snapshot,
      template_version: normalized.tipoDocumento === "ALTERACAO" ? "alteracao-v1" : "constituicao-v2-vila-salvi"
    };

    let result;
    if(existing){
      result = await client.from("contracts").update(payload).eq("id", existing.id).select().single();
    }else{
      result = await client.from("contracts").insert(payload).select().single();
    }
    if(result.error){
      alert("Não foi possível salvar o contrato no Supabase: " + result.error.message);
      return;
    }

    editingId = result.data.id;
    await loadHistory();
    currentGenerated = normalized;
    document.getElementById("printArea").innerHTML = snapshot;
    document.getElementById("contractModal").classList.remove("hidden");
  };

  window.previewContract = function(id=null){
    if(id){
      const item = historyCache.find(x => x.id === id);
      if(!item) return;
      currentGenerated = normalizeData(JSON.parse(JSON.stringify(item.data)));
      document.getElementById("printArea").innerHTML = item.documentHtml || contractHtml(currentGenerated);
      document.getElementById("contractModal").classList.remove("hidden");
      return;
    }
    const data = normalizeData(JSON.parse(JSON.stringify(formData)));
    currentGenerated = data;
    document.getElementById("printArea").innerHTML = contractHtml(data);
    document.getElementById("contractModal").classList.remove("hidden");
  };

  window.supabaseDeleteContract = async function(id){
    if(!confirm("Excluir este contrato do histórico?")) return;
    const { error } = await client.from("contracts").delete().eq("id", id);
    if(error){
      alert("Não foi possível excluir: " + error.message);
      return;
    }
    await loadHistory();
  };

  // Mantém o snapshot histórico para Word quando possível.
  window.downloadHistoryWord = function(id){
    const item = historyCache.find(x => x.id === id);
    if(!item) return;
    // A versão atual gera .doc compatível com Word. O backend poderá evoluir para .docx nativo.
    const data = normalizeData(JSON.parse(JSON.stringify(item.data)));
    const original = window.contractHtml;
    if(item.documentHtml){
      window.contractHtml = () => item.documentHtml;
      try { downloadWordFromData(data); }
      finally { window.contractHtml = original; }
    }else{
      downloadWordFromData(data);
    }
  };

  async function init(){
    if(!configured){
      window.SUPABASE_STATUS = { configured:false, adapterLoaded:true };
      setLoginMessage("Supabase ainda não configurado. Verifique assets/js/config.js.");
      return;
    }
    if(!window.supabase?.createClient){
      setLoginMessage("Não foi possível carregar a biblioteca do Supabase.");
      return;
    }
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    window.supabaseClient = client;
    window.SUPABASE_STATUS = {
      configured: true,
      url: cfg.supabaseUrl,
      adapterLoaded: true
    };
    console.info("OSC Supabase adapter carregado:", window.SUPABASE_STATUS);

    const { data } = await client.auth.getSession();
    if(data.session){
      window.CURRENT_SUPABASE_USER = data.session.user;
      window.updatePrintPaginationStyle?.();
      try{
        await loadHistory();
        window.showApp();
      }catch(err){
        console.error(err);
        setLoginMessage("Falha ao carregar o histórico do Supabase.");
      }
    }
  }

  init();
})();
