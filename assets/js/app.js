const steps = ["Empresa","Sócios","Capital","Objeto Social","Administração","Revisão"];
  let currentStep = 0;
  let editingId = null;
  let currentGenerated = null;

  const blankData = () => ({
    empresa:{
      naturezaJuridica:"SOCIEDADE_EMPRESARIA_LIMITADA",
      porte:"ME",
      razaoSocial:"",
      endereco:"",
      numero:"",
      complemento:"",
      bairro:"",
      cidade:"",
      uf:"SP",
      cep:"",
      dataContrato:new Date().toISOString().slice(0,10)
    },
    socios:[
      {
        nome:"",
        sexo:"MASCULINO",
        nacionalidade:"brasileiro",
        estadoCivil:"solteiro",
        dataNascimento:"",
        profissao:"empresário",
        rg:"",
        orgaoEmissor:"SSP",
        ufRg:"SP",
        cpf:"",
        regimeCasamento:"",
        endereco:{
          logradouro:"",
          numero:"",
          complemento:"",
          bairro:"",
          cidade:"",
          uf:"SP",
          cep:""
        },
        capital:0,
        administrador:true
      }
    ],
    capital:{
      total:0,
      valorQuota:1
    },
    objeto:"",
    administracao:{
      forma:"isoladamente"
    }
  });

  let formData = blankData();

  function showView(view){
    document.getElementById("homeView").classList.add("hidden");
    document.getElementById("generatorView").classList.add("hidden");
    document.getElementById("historyView").classList.add("hidden");
    if(view==="home") document.getElementById("homeView").classList.remove("hidden");
    if(view==="generator") document.getElementById("generatorView").classList.remove("hidden");
    if(view==="history"){
      document.getElementById("historyView").classList.remove("hidden");
      renderHistory();
    }
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function startNewContract(){
    formData = blankData();
    editingId = null;
    currentStep = 0;
    showView("generator");
    renderStep();
  }

  function editContract(id){
    const hist = getHistory();
    const item = hist.find(x => x.id === id);
    if(!item) return;
    formData = normalizeData(JSON.parse(JSON.stringify(item.data)));
    editingId = id;
    currentStep = 0;
    showView("generator");
    renderStep();
  }

  function renderSteps(){
    const bar = document.getElementById("stepsBar");
    bar.innerHTML = steps.map((s,i)=>{
      let cls="step";
      if(i===currentStep) cls+=" active";
      if(i<currentStep) cls+=" done";
      return `<div class="${cls}">${i+1}. ${s}</div>`;
    }).join("");
  }

  function renderStep(){
    renderSteps();
    const c = document.getElementById("stepContent");
    if(currentStep===0) c.innerHTML = empresaStep();
    if(currentStep===1) c.innerHTML = sociosStep();
    if(currentStep===2) c.innerHTML = capitalStep();
    if(currentStep===3) c.innerHTML = objetoStep();
    if(currentStep===4) c.innerHTML = administracaoStep();
    if(currentStep===5) c.innerHTML = revisaoStep();
  }

  function empresaStep(){
    const e = formData.empresa;
    return `
      <div class="form-grid">
        <div class="field full">
          <label>Natureza jurídica</label>
          <select onchange="formData.empresa.naturezaJuridica=this.value">
            <option value="SOCIEDADE_EMPRESARIA_LIMITADA" ${e.naturezaJuridica==="SOCIEDADE_EMPRESARIA_LIMITADA"?"selected":""}>Sociedade Empresária Limitada</option>
            <option value="SOCIEDADE_LIMITADA_UNIPESSOAL" ${e.naturezaJuridica==="SOCIEDADE_LIMITADA_UNIPESSOAL"?"selected":""}>Sociedade Limitada Unipessoal</option>
          </select>
          <div class="muted" style="font-size:12px;margin-top:5px">
            Nesta versão, as opções acima utilizam o modelo de contrato de constituição de LTDA.
          </div>
        </div>
        <div class="field third">
          <label>Porte da empresa</label>
          <select onchange="formData.empresa.porte=this.value">
            <option value="ME" ${e.porte==="ME"?"selected":""}>ME - Microempresa</option>
            <option value="EPP" ${e.porte==="EPP"?"selected":""}>EPP - Empresa de Pequeno Porte</option>
          </select>
        </div>
        <div class="field full">
          <label>Razão social</label>
          <input value="${esc(e.razaoSocial)}" oninput="formData.empresa.razaoSocial=this.value" placeholder="Ex.: ABC COMÉRCIO LTDA">
        </div>
        <div class="field full">
          <label>Logradouro</label>
          <input data-flat-address-field="logradouro" value="${esc(e.endereco)}" oninput="formData.empresa.endereco=this.value" placeholder="Rua, Avenida...">
        </div>
        <div class="field quarter">
          <label>Número</label>
          <input value="${esc(e.numero)}" oninput="formData.empresa.numero=this.value">
        </div>
        <div class="field">
          <label>Complemento</label>
          <input value="${esc(e.complemento)}" oninput="formData.empresa.complemento=this.value">
        </div>
        <div class="field quarter">
          <label>CEP</label>
          <input inputmode="numeric" maxlength="9" value="${esc(e.cep)}"
                 oninput="this.value=maskCEP(this.value);formData.empresa.cep=this.value;maybeLookupCEPFlat(this)"
                 onblur="maybeLookupCEPFlat(this)"
                 placeholder="00000-000">
          <div class="cep-feedback" data-flat-cep-feedback></div>
        </div>
        <div class="field third">
          <label>Bairro</label>
          <input data-flat-address-field="bairro" value="${esc(e.bairro)}" oninput="formData.empresa.bairro=this.value">
        </div>
        <div class="field third">
          <label>Cidade</label>
          <input data-flat-address-field="cidade" value="${esc(e.cidade)}" oninput="formData.empresa.cidade=this.value">
        </div>
        <div class="field third">
          <label>UF</label>
          <select data-flat-address-field="uf" onchange="formData.empresa.uf=this.value">${ufOptions(e.uf)}</select>
        </div>
        <div class="field third">
          <label>Data do contrato</label>
          <input type="date" value="${e.dataContrato}" oninput="formData.empresa.dataContrato=this.value">
        </div>
      </div>
      ${navButtons(false,true)}
    `;
  }

  function sociosStep(){
    const cards = formData.socios.map((s,i)=>{
      const end = getSocioEndereco(s);
      const regime = s.regimeCasamento || "";
      return `
      <div class="socio-card">
        <div class="head">
          <strong>Sócio ${i+1}</strong>
          ${formData.socios.length>1?`<button class="btn btn-danger small" onclick="removeSocio(${i})">Remover</button>`:""}
        </div>
        <div class="body">
          <div class="form-grid">
            <div class="field full">
              <label>Nome completo</label>
              <input value="${esc(s.nome)}" oninput="formData.socios[${i}].nome=this.value">
            </div>

            <div class="field third">
              <label>Sexo</label>
              <select onchange="formData.socios[${i}].sexo=this.value">
                <option value="MASCULINO" ${s.sexo==="MASCULINO"?"selected":""}>Masculino</option>
                <option value="FEMININO" ${s.sexo==="FEMININO"?"selected":""}>Feminino</option>
              </select>
            </div>

            <div class="field third">
              <label>Nacionalidade</label>
              <input value="${esc(s.nacionalidade)}" oninput="formData.socios[${i}].nacionalidade=this.value">
            </div>

            <div class="field third">
              <label>Estado civil</label>
              <select onchange="formData.socios[${i}].estadoCivil=this.value;if(this.value!=='casado'){formData.socios[${i}].regimeCasamento='';}renderStep()">
                ${optionList(["solteiro","casado","divorciado","viúvo","separado"],s.estadoCivil)}
              </select>
            </div>

            <div class="field third">
              <label>Data de nascimento</label>
              <input type="date" value="${s.dataNascimento}" oninput="formData.socios[${i}].dataNascimento=this.value">
            </div>

            ${s.estadoCivil==="casado" ? `
              <div class="field full">
                <label>Regime de casamento</label>
                <select onchange="formData.socios[${i}].regimeCasamento=this.value">
                  <option value="">Selecione...</option>
                  <option value="Comunhão parcial de bens" ${regime==="Comunhão parcial de bens"?"selected":""}>Comunhão parcial de bens</option>
                  <option value="Comunhão universal de bens" ${regime==="Comunhão universal de bens"?"selected":""}>Comunhão universal de bens</option>
                  <option value="Separação total de bens" ${regime==="Separação total de bens"?"selected":""}>Separação total de bens</option>
                </select>
              </div>
            ` : ""}

            <div class="field third">
              <label>Profissão</label>
              <input value="${esc(s.profissao)}" oninput="formData.socios[${i}].profissao=this.value">
            </div>

            <div class="field third">
              <label>RG</label>
              <input value="${esc(s.rg)}" oninput="formData.socios[${i}].rg=this.value">
            </div>

            <div class="field third">
              <label>Órgão / UF</label>
              <div style="display:grid;grid-template-columns:1fr 90px;gap:8px">
                <input value="${esc(s.orgaoEmissor)}" oninput="formData.socios[${i}].orgaoEmissor=this.value">
                <select onchange="formData.socios[${i}].ufRg=this.value">${ufOptions(s.ufRg)}</select>
              </div>
            </div>

            <div class="field">
              <label>CPF</label>
              <input
                inputmode="numeric"
                maxlength="14"
                placeholder="000.000.000-00"
                value="${esc(s.cpf)}"
                oninput="this.value=maskCPF(this.value);formData.socios[${i}].cpf=this.value"
                onblur="this.value=maskCPF(this.value);formData.socios[${i}].cpf=this.value">
              <div class="muted" style="font-size:12px;margin-top:5px">Formato obrigatório: 000.000.000-00</div>
            </div>

            <div class="field full" style="margin-top:6px">
              <div style="font-weight:800;font-size:13px;border-top:1px solid var(--line);padding-top:14px">Endereço residencial</div>
            </div>

            <div class="field full">
              <label>Logradouro</label>
              <input data-address-path="formData.socios[${i}].endereco" data-address-field="logradouro"
                     value="${esc(end.logradouro)}" oninput="formData.socios[${i}].endereco.logradouro=this.value" placeholder="Rua, Avenida...">
            </div>

            <div class="field quarter">
              <label>Número</label>
              <input value="${esc(end.numero)}" oninput="formData.socios[${i}].endereco.numero=this.value">
            </div>

            <div class="field">
              <label>Complemento</label>
              <input value="${esc(end.complemento)}" oninput="formData.socios[${i}].endereco.complemento=this.value">
            </div>

            <div class="field quarter">
              <label>CEP</label>
              <input inputmode="numeric" maxlength="9" value="${esc(end.cep)}"
                     oninput="this.value=maskCEP(this.value);formData.socios[${i}].endereco.cep=this.value;maybeLookupCEPStructured('formData.socios[${i}].endereco',this)"
                     onblur="maybeLookupCEPStructured('formData.socios[${i}].endereco',this)"
                     placeholder="00000-000">
              <div class="cep-feedback" data-cep-feedback-path="formData.socios[${i}].endereco"></div>
            </div>

            <div class="field third">
              <label>Bairro</label>
              <input data-address-path="formData.socios[${i}].endereco" data-address-field="bairro"
                     value="${esc(end.bairro)}" oninput="formData.socios[${i}].endereco.bairro=this.value">
            </div>

            <div class="field third">
              <label>Cidade</label>
              <input data-address-path="formData.socios[${i}].endereco" data-address-field="cidade"
                     value="${esc(end.cidade)}" oninput="formData.socios[${i}].endereco.cidade=this.value">
            </div>

            <div class="field third">
              <label>UF</label>
              <select data-address-path="formData.socios[${i}].endereco" data-address-field="uf"
                      onchange="formData.socios[${i}].endereco.uf=this.value">${ufOptions(end.uf)}</select>
            </div>
          </div>
        </div>
      </div>`;
    }).join("");

    return `
      ${cards}
      <button class="btn btn-secondary" onclick="addSocio()">+ Adicionar sócio</button>
      ${navButtons(true,true)}
    `;
  }

  function capitalStep(){
    const totalSocios = formData.socios.reduce((a,s)=>a+(Number(s.capital)||0),0);
    const total = Number(formData.capital.total)||0;
    const ok = Math.abs(total-totalSocios) < 0.01 && total>0;
    const valorQuota = Number(formData.capital.valorQuota)||1;
    return `
      <div class="form-grid">
        <div class="field">
          <label>Capital social (R$)</label>
          <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(formData.capital.total)}"
                 onfocus="this.value=currencyEditValue(formData.capital.total)"
                 onblur="formData.capital.total=parseCurrency(this.value);this.value=currencyInputValue(formData.capital.total);renderStep()">
        </div>
        <div class="field">
          <label>Valor da quota (R$)</label>
          <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(formData.capital.valorQuota || 1)}"
                 onfocus="this.value=currencyEditValue(formData.capital.valorQuota || 1)"
                 onblur="formData.capital.valorQuota=parseCurrency(this.value)||1;this.value=currencyInputValue(formData.capital.valorQuota);renderStep()">
        </div>
        <div class="field">
          <label>Quantidade total de quotas</label>
          <input class="number-input" type="text" value="${formatQuotaNumber(total / valorQuota)}" disabled>
        </div>
      </div>
      <div style="margin-top:18px">
        ${formData.socios.map((s,i)=>{
          const cap = Number(s.capital)||0;
          const pct = total>0 ? cap/total*100 : 0;
          const quotas = valorQuota>0 ? cap/valorQuota : 0;
          return `
            <div class="socio-card">
              <div class="body">
                <div class="form-grid">
                  <div class="field">
                    <label>${esc(s.nome || "Sócio "+(i+1))} — capital integralizado (R$)</label>
                    <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(s.capital)}"
                      onfocus="this.value=currencyEditValue(formData.socios[${i}].capital)"
                      onblur="formData.socios[${i}].capital=parseCurrency(this.value);this.value=currencyInputValue(formData.socios[${i}].capital);renderStep()">
                  </div>
                  <div class="field third">
                    <label>Participação</label>
                    <input value="${pct.toFixed(2)}%" disabled>
                  </div>
                  <div class="field third">
                    <label>Quotas</label>
                    <input class="number-input" value="${formatQuotaNumber(quotas)}" disabled>
                  </div>
                </div>
              </div>
            </div>`;
        }).join("")}
      </div>
      <div class="notice ${ok?"success":"error"}">
        ${ok
          ? `✓ Capital conferido: ${money(total)} distribuído em 100% entre os sócios.`
          : `Atenção: capital social = ${money(total)} e distribuição dos sócios = ${money(totalSocios)}.`}
      </div>
      ${navButtons(true,true,!ok)}
    `;
  }

  function objetoStep(){
    return `
      <div class="field full">
        <label>Objeto social</label>
        <textarea oninput="formData.objeto=this.value" placeholder="Digite o objeto social que deverá constar no contrato.">${esc(formData.objeto)}</textarea>
      </div>
      <div class="notice info" style="margin-top:12px">
        Neste protótipo, o campo é preenchido manualmente. A integração com IA pode ser adicionada na versão real.
      </div>
      ${navButtons(true,true)}
    `;
  }

  function administracaoStep(){
    return `
      <div class="notice info" style="margin-bottom:14px">
        Selecione quem será administrador da sociedade.
      </div>
      <div class="grid">
        ${formData.socios.map((s,i)=>`
          <label style="display:flex;align-items:center;gap:10px;border:1px solid var(--line);padding:12px;border-radius:10px;background:#fff">
            <input type="checkbox" style="width:auto" ${s.administrador?"checked":""}
              onchange="formData.socios[${i}].administrador=this.checked">
            <span>${esc(s.nome || "Sócio "+(i+1))}</span>
          </label>
        `).join("")}
      </div>
      <div class="field" style="margin-top:16px">
        <label>Forma de administração</label>
        <select onchange="formData.administracao.forma=this.value">
          <option value="isoladamente" ${formData.administracao.forma==="isoladamente"?"selected":""}>Isoladamente</option>
          <option value="em conjunto" ${formData.administracao.forma==="em conjunto"?"selected":""}>Em conjunto</option>
        </select>
      </div>
      ${navButtons(true,true)}
    `;
  }

  function revisaoStep(){
    const e=formData.empresa;
    const total=Number(formData.capital.total)||0;
    const admins=formData.socios.filter(s=>s.administrador).map(s=>s.nome || "Sócio").join(", ");
    const issues=validateAll();
    return `
      <div class="summary">
        <div class="summary-box">
          <h4>Empresa</h4>
          <p><strong>${esc(e.razaoSocial || "Não informado")}</strong></p>
          <p>${esc(naturezaLabel(e.naturezaJuridica))}</p>
          <p>${esc(fullCompanyAddress())}</p>
        </div>
        <div class="summary-box">
          <h4>Capital social</h4>
          <p><strong>${money(total)}</strong></p>
          <p>Valor da quota: ${money(Number(formData.capital.valorQuota)||1)}</p>
        </div>
        <div class="summary-box">
          <h4>Sócios</h4>
          ${formData.socios.map(s=>`<p>${esc(s.nome || "Não informado")} — ${money(Number(s.capital)||0)}</p>`).join("")}
        </div>
        <div class="summary-box">
          <h4>Administração</h4>
          <p>${esc(admins || "Nenhum administrador selecionado")}</p>
          <p>${esc(formData.administracao.forma)}</p>
        </div>
        <div class="summary-box" style="grid-column:1/-1">
          <h4>Objeto social</h4>
          <p>${esc(formData.objeto || "Não informado")}</p>
        </div>
      </div>
      <div style="margin-top:14px" class="notice ${issues.length?"error":"success"}">
        ${issues.length
          ? `<strong>Revise antes de gerar:</strong><br>${issues.map(x=>"• "+esc(x)).join("<br>")}`
          : "✓ Dados mínimos conferidos para este protótipo."}
      </div>
      <div class="nav-row">
        <button class="btn btn-secondary" onclick="prevStep()">Voltar</button>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" onclick="previewContract()">Visualizar contrato</button>
          <button class="btn btn-primary" onclick="generateAndSave()" ${issues.length?"disabled style='opacity:.5;cursor:not-allowed'":""}>Gerar contrato</button>
        </div>
      </div>
    `;
  }

  function navButtons(back,next,disableNext=false){
    return `
      <div class="nav-row">
        <div>${back?`<button class="btn btn-secondary" onclick="prevStep()">Voltar</button>`:""}</div>
        <div>${next?`<button class="btn btn-primary" onclick="nextStep()" ${disableNext?"disabled style='opacity:.5;cursor:not-allowed'":""}>Continuar</button>`:""}</div>
      </div>`;
  }

  function nextStep(){
    if(currentStep<steps.length-1){currentStep++;renderStep();window.scrollTo({top:70,behavior:"smooth"})}
  }
  function prevStep(){
    if(currentStep>0){currentStep--;renderStep();window.scrollTo({top:70,behavior:"smooth"})}
  }

  function addSocio(){
    formData.socios.push({
      nome:"",nacionalidade:"brasileiro",estadoCivil:"solteiro",
      dataNascimento:"",profissao:"empresário",rg:"",orgaoEmissor:"SSP",
      ufRg:"SP",cpf:"",regimeCasamento:"",
      endereco:{logradouro:"",numero:"",complemento:"",bairro:"",cidade:"",uf:"SP",cep:""},
      capital:0,administrador:false
    });
    renderStep();
  }

  function removeSocio(i){
    formData.socios.splice(i,1);
    renderStep();
  }

  function validateAll(){
    const issues=[];
    if(!formData.empresa.razaoSocial.trim()) issues.push("Informe a razão social.");
    if(!formData.empresa.endereco.trim()) issues.push("Informe o endereço da sede.");
    if(!formData.empresa.cidade.trim()) issues.push("Informe a cidade da sede.");
    if(!formData.objeto.trim()) issues.push("Informe o objeto social.");
    if((Number(formData.capital.total)||0)<=0) issues.push("Informe o capital social.");
    const dist=formData.socios.reduce((a,s)=>a+(Number(s.capital)||0),0);
    if(Math.abs((Number(formData.capital.total)||0)-dist)>.01) issues.push("A distribuição do capital entre os sócios não confere.");
    if(formData.empresa.cep && !/^\d{5}-\d{3}$/.test(formData.empresa.cep)){
      issues.push("CEP da empresa deve estar no formato 00000-000.");
    }
    formData.socios.forEach((s,i)=>{
      const end = getSocioEndereco(s);
      if(!s.nome.trim()) issues.push(`Informe o nome do Sócio ${i+1}.`);
      if(!s.cpf.trim()) {
        issues.push(`Informe o CPF do Sócio ${i+1}.`);
      } else if(!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s.cpf)) {
        issues.push(`CPF do Sócio ${i+1} deve estar no formato 000.000.000-00.`);
      }
      if(s.estadoCivil==="casado" && !s.regimeCasamento){
        issues.push(`Informe o regime de casamento do Sócio ${i+1}.`);
      }
      if(!end.logradouro.trim()) issues.push(`Informe o logradouro residencial do Sócio ${i+1}.`);
      if(!end.cidade.trim()) issues.push(`Informe a cidade do endereço do Sócio ${i+1}.`);
      if(end.cep && !/^\d{5}-\d{3}$/.test(end.cep)){
        issues.push(`CEP do Sócio ${i+1} deve estar no formato 00000-000.`);
      }
    });
    const qv=Number(formData.capital.valorQuota)||1;
    const tq=(Number(formData.capital.total)||0)/qv;
    if(Math.abs(tq-Math.round(tq))>0.000001) issues.push("A quantidade total de quotas deve resultar em número inteiro.");
    if(!formData.socios.some(s=>s.administrador)) issues.push("Selecione pelo menos um administrador.");
    if(formData.empresa.naturezaJuridica==="SOCIEDADE_LIMITADA_UNIPESSOAL" && formData.socios.length!==1){
      issues.push("Sociedade Limitada Unipessoal deve possuir apenas um sócio neste protótipo.");
    }
    return issues;
  }

  function generateAndSave(){
    if(typeof window.supabaseSaveContract === "function"){
      return window.supabaseSaveContract();
    }
    const issues=validateAll();
    if(issues.length){alert("Revise os campos obrigatórios.");return}
    const id = editingId || ("ct_"+Date.now());
    const now = new Date().toISOString();
    const item = {
      id,
      createdAt: editingId ? (getHistory().find(x=>x.id===editingId)?.createdAt || now) : now,
      updatedAt: now,
      data: JSON.parse(JSON.stringify(formData))
    };
    let hist=getHistory().filter(x=>x.id!==id);
    hist.unshift(item);
    localStorage.setItem("osc_contract_history",JSON.stringify(hist));
    editingId=id;
    previewContract();
  }

  function previewContract(id=null){
    let data=normalizeData(JSON.parse(JSON.stringify(formData)));
    if(id){
      const item=getHistory().find(x=>x.id===id);
      if(!item) return;
      data=normalizeData(JSON.parse(JSON.stringify(item.data)));
    }
    currentGenerated = data;
    document.getElementById("printArea").innerHTML = contractHtml(data);
    document.getElementById("contractModal").classList.remove("hidden");
  }

  function closeModal(){
    document.getElementById("contractModal").classList.add("hidden");
  }

  function contractHtml(d){
    const e=d.empresa;
    const socios=d.socios;
    const total=Number(d.capital.total)||0;
    const vq=Number(d.capital.valorQuota)||1;
    const totalQuotas=vq>0?total/vq:0;
    const qual=socios.map(s=>`<p class="qualification">${socioQualification(s)}</p>`).join("");
    const admins=socios.filter(s=>s.administrador);
    const adminNames=admins.map(s=>s.nome).filter(Boolean);
    const adminText=adminNames.length ? adminNames.join(", ") : "xxxxxx";
    const cidade=e.cidade || "São Paulo";
    const porte=e.porte==="EPP" ? "EPP" : "ME";
    const porteDescricao=porte==="EPP" ? "Empresa de Pequeno Porte - EPP" : "Microempresa - ME";
    const socioPrincipal=socios[0] || {};
    const adminPrincipal=admins[0] || socioPrincipal;

    const capitalRows=socios.map(s=>{
      const capitalSocio=Number(s.capital)||0;
      const quotas=vq>0 ? capitalSocio/vq : 0;
      const pct=total>0 ? capitalSocio/total*100 : 0;
      return `
        <tr>
          <td>${esc(s.nome)}</td>
          <td class="num">${formatQuotaNumber(quotas)}</td>
          <td class="num">${pct.toFixed(0)}%</td>
          <td class="num">${money(capitalSocio)}</td>
        </tr>`;
    }).join("");

    return `
      <div class="contract-page constitution-contract">
        <div class="logos">
          <img class="logo-img souza" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXEAAACECAYAAABmrxu6AAAQAElEQVR4Aez9BYCcW3YdCq/zfVXV3dXMzCC1qMWsq8tMQ3c85AFPnDh2YsdxnD/vD/1/HiTPTpxnimlsD3s8cJl0QcyMLbUapGZm7q6qt9bpbl1dXUGLpTtVqqOq+uDAPuesvffa53zthEKhQDiFZRAeA+ExEB4D990Y+M/gy2EyTPoMJyAsg7AMwmMgPAbulzFA6J7qLPvlfv0vGAphMhDA2PgEhkfHMDA0gt6BIfT0D6K7bxBdfQPo7FXq56fSgD3WzXO6pm9wGAPDIxgZG8f4xCTzCoJZ3q/iCNc7LIF7XwLhGt5SCUjj3NIM72RmAvDxiQkL2o3tXThV14h9p6qx5eAJvLP7KN7ceQivbTuAl7fsxc8/3IuffbgHr27dh9e3HbTn3t1zFFsPncKByhqcOd+C5o5u9BPUA8HAnWxGuKywBMISCEvghiVwX4A4uTpMTAasBX22oQW7j5/BmzsO4odvb8dfv/wB/uyn7+JP//Ed/BW///0bW/HDTbvwkw/24B8F3Jv34xdbDuAXWw/gZaafb9mPn23eh5/y3E/e34MfvLsDf/f6VvzFLzbZfP7sZ+/gr195Hz/etIOK4DD2UynUNrWhV+AeCN6woMM3hiUQlkBYArdDAvcsiAeCQUuPdJMWaaKFXFXfgoOna7H54ElrXf/wnR0E2w/w5z97F/+L6a9ffh8/eGc7fr5lH97adQTv7TuODw+cxBZa2tuOnMaOo2eYqrD18Gls5rEPeG4Tr3ljx2H8jID+vTe34q8I3srvT3/6Dv7m1Q8J5Dvxxo5D2Ha4EkfO1KGGYN7S2WMt/1HSN6rj7eiUcJ73mgTC9QlL4N6VwD0J4sFgyAJ41flmvL3rsLWQ/+Nf/gP+01/9I/77D9/EP7y/F1sJypU839Ldh6HRcQQRAgj8SiFy5KHgJD6ZAp84BlEnIVnYIfLhAQyOjKG5sw/HaxrxwYFKfP+dnfiDH7yO/+3PfsTyf2IVxwcHTuB8SweGRkbv3Z4N1ywsgbAEfikkcM+A+MTkpA1GHjt7Hq+TKpEl/DevbYYoj/f3n8D+ylqcPteMhtYOtHX18NoBgvcYxkmzBIjfMC7DtEwwUx2n6CSTYXJ4XmeUjMBeoM3jUNLVhvc4LkLGgRiTsfFJDA6PMjDaj9bObpxvbkfl+SbsOVGNt/ccpYW+C3/5i/fwXVrv4t0rycX3MJiqrMIpLIGwBMISuJMSuKsgPsV1E7wJgLJsD1fV4d29R/Ej8tSiNkSPCMBP1TWhs3cQAlcrHIKwwNnjGET5fIiL9iM5PhbpyYnISktGbnoK8jNTUZSdhuKcdJTkZKA0JxOluRn8no7i7HQUZqYhPyMVObw2KzUJaUkJSIqLRWx0FCJ9XriSDMsBU5BpbGISbd39OHq2nlz5Ufz9G1vwHVIuqut7+4/jWPV5iPbpHxohfz9pq3kX/wsXHZZAWAK/JBIQVN21pk7Qim7v6ccH5Kb/lMHJ//xXP8N3GGTcfvQMWjp7MTExQYpkkjiq1SI0px0HxvEAtJp9BNqEmCgUZaVgRXkhnli1CF96bDX+2Wcexr/56nP4z99+Cf/Xb34Ff/Dbv4o/+J2vTSV+/8Pf/jr+73/5qzz3ZfyHb38Ov/ulp/Ht5x/CFx9ehUeXz8Pi0jyCexLi/JF20bhhWSrTGJdyYh1IvwQDE3Y5Yn1bNzn3M1Dd/+vfv4I/+8k72HO8CmoTLw6/wxIISyAsgdsuAee2l3CZArSmu7qhlRbtEfzd61vwjx/sIRiesksEG9s60ctgptZsh2AAY+C6DhJiolFKq3rdojJ89sEV+OazD+I3v/Ak/tlnH8M3nt2ILz62Bs9vWIYnVlfgoeXzsW7xXKxaUIoV80qwvLwYy2wq4vcSrJxfgtULy7BhcTkeXrEAT61ZjBc3LsevPL4O33ruIfzG555gehzffP5hm+eq+cUoyExBTKTP1gXGIQcPjI6Pk9bpR2Nbl7XQZZF/961tUNB1Ez2KBh7X+nOEX2EJhCUQlsBtksAdA/Ep6iQAccda5bH1cCX+8f3dFsQ37TuOKoL68NgY44ykIkhfuKRKYvxRpDkSUZidgSVz8vHg0nK8sHEZvv7MRgvev/G5x/ENgu7nHl6Nx2iJC5gXluSTQslATloS0hLjSZHEIDEuBgmx0TYlxkVb6iUtKd7SLmV5WagoK8CaRXPwJMH8pUfX4tcI3r/xeQI501ef3IDn1i/F+ooyLCjORT5pmJTEBPgjIyA6R4FUMBDbOziEU+TsX96yDz94ezt+8t5u7Dp+Blqe2D80TK5dwVOEX2EJhCUQlsAtlYBzS3O7SmaTjBh29w/g/X3H8Ec/fgt/9vNN+PDQKXT2DWBifIy0iSgT0Mj1wHE9iImKwKKSXLz06Cr8u6+/gP/yz34F/+rLz+KlR9Zg1fxS5JHPjo4i5UGKBbfwZQzgMM/4GD+pmjSsp0X/ZQL573/tRfz/WYff+eJTeH79YpTlpSOO14hu4Q22BloNQ+4Hje3deP/ASfzB91+3vPmuY1U2UGovCv8XlkBYAmEJ3EIJOLcwrytm1d7TB22akYX6sw/3QWu2axvbSJsQwCcnINrEGIfWrQ/lBdl4Zt0S/NoLD+MbzzyIFx9YQSt4LuYVZhO4U5CaGIe4C8FHBwa3/iUg97guIiN8EJin02ovyEpFRSm9gWXz8fmHV+PXX3wUX3v6ATxO+qaQAdQYcuhgG2CMpVm62ObqxlZsPlSJf6DH8VOmw2fq7NLJIC33W1/rcI5hCYQlcH0S+HRc7dzOZkxZ34M4Xl2Pt3Ydxnff2GY34Zxv7cQ4+WTREA5BTxZ1RkqCBfBHGFz8MrnpX3/xMVrha7CWNEduejIifT7o2ttZ36vl7ToOYknvlORmYCOB/GtPbyQv/5Dl4jcumWvrrhUuU/WkY8EA6DgDs2fqm/HmzsP4HikWbfPXpiVRLwrqXq288LmwBMISCEtgNhK4rSDeNziMt3Yesrz3j97dhYaOboK3qJNJ1s0AjouoyEgCYBa+9Pha/PtvfQ7/lIHKjUvnISM5AV6Py+vuvbdhlUS55GWk4HFy8b//tRfwu196Bp9/aKX1FtQmQ0qILgbRPICRkRFoY5Is8j/68ZvYd6Ianb39zCX8DksgLIGwBG5OArccxGcCmMdr6vHzzXvx6rZD2F9Zg9auHowpcEkqwXFd+C3nnYfPEvi+zkDlcxuWY9ncIguCCkL6vB4yE4LLm2vg7bpbNdN68iQGTfMJ5lrx8sIDy/Frzz9k6aCyvEyIjgEMRJ8MDY+gvqXDbhj64bs78O7uI6huaIFW6iD8CktgdhIIXxWWwCckcEtBXAA+Oj6BhrZO+9ySH2/aia1HKtHQ3gUF/PgffKRFkuLiGBjMwqMrF+KrDBp+8dG1NliZkhAHcdGfqOU9fsAYg8yUREv9/OpTG/HFR9fgwSXldlVNXGw0HQ4HJhS0XLmetvj69gN4Zet+bD9yGs2dPRgdG7/HWxiuXlgCYQncqxJwbmXFxPM2tXfjb1/bTCt8H07WNWGYFihNUYBAZ0gxiPteXzEHv/eVZ/CrT2/AkrIC+CN9+DS8RLEowCke/9c/8yh+47OPYu3CMkRFRMDxeG0TQ+TKJac9J6vxndc322fD1Da323Ph/8ISCEsgLIHrlcAtAXFZ4BMTkzh69hx+QQply+FKSxUMDg8Tv7U+2hCoI1FRko/n1y/DV55cZzfi5GekQqAn8Lveit+L11NP2c1AWtFSlJWGjUvL8fmHV9lUmJUKBXBhHEheem65gpyvbjuITXuO4mRNg/3DFPdiu26mTuF7wxIIS+D2SuCWgPgYAbyhrQtbDp7ETz/cY4N4+us6CAjAgZjoKFILaXhs5QJ8jhz4M+uWIjs1CRE+7+1t3V3MXW0rzc20G4i++uR6rF9UBj3PxR8VCccRox7C4NAI9IgBPTpXj9jVY27DHPld7LRw0WEJ3IcSuGkQDzJQ2dHTj++9tRWv7ziM2pYujI2Okv4OgWhFFsVYyuQbTz+ALz+xHguK8+5DMd14lfVwroUlefitLzyJzz+4EsW0yCMjIyGLnELiO4Aj9GB+/N4ubD5wAvWtnQi/whIISyAsgdlK4KZBvKq+GW/tPGz/2EJNYxtGRkZJoRDADeymHD2b5DlSKA8tX4D8jBRSChGzrdvdue4Wl+pxHcT4o+yjAB5duQhffGwtFlGRJcXHwgJ5iBY54wY1ja14ZdsBbGMguLmjJ/wkRIRfYQmEJTAbCdwwiAdIlYgy2Xuy2q60OHW+2T4XBQzc0fy2AF6Wl4HP0vrUM0nmFeZML7mbTbU+Xdc4xljqaMmcQvLjq/HI8vkQ1TJFrTi0xoEBUiv6K0Qf7D8B7ezs5++g/sjFp0sU4daEJRCWwC2WABHkxnIcoPUoDlzP+z509jyGCToIkQMnYCnHZXOL8fWnN+JhWuDacaljv+zJcRxoC//XSC09v2Gpfbb5FLViEAoFrAcjpfi9t7fZB2cNj4aXHv6yj5lw+38pJHBTjbwhENdOzNO0vLWV/tDpWgwM6il92oXJICapg9ULShnEXIgHlsxDenKCtUJvqpbXuHl8bBQDfT3oaGtGU30tztecwbnq03cl1alclt/ccA6jIzOrc6YaIP3m83qRnZZE2ZTjMxtX2IdsXVi1Qsu7s3cAJ2oa8ebOQ/bRvCSmpm6+R/6XdzAyPITujjYr67qqUzhz8ghOHj2Ak0f24+RhpiP7+H0fTh8/hJrTx1FfdxYdrU0Y7O9FYHKSCuv6WjU+PoZ+9m9rU4Pt27OnjqHy4vJY5in+Vj3O1ZxGa1M9+nq6MG43l9GwuIbshgb60d7SaO9rbTpvv+v+sdGRa9w5dVoyGR4aRHdnu82jpfE8lDQeFR/SeV2pVUmSgerXaq85B42TG0nKv625AV3sB/WH8p9tGhocQDv7Q/VQPi2N59BGmXV3tmGY54LypmebWfi6uy6B6wbxIAOZDQy+7T52BlsOVeKc1jjTilRLoiIjkJOejGfWLrEWeKl2Ld6mFSiTExPQ4O3r7YYmS+P5WpwngAo0zpw4jLuZqk4cQd3ZSmiyBAIBieZCEpC7joOFxbnQDs9V84qRnZoI1/WA9ji0VLOtu8/GGfTQsJ7+QUySurqQwV36IgASIAncNPnra6tQTYA+ffwgTh3ehxMHd3+UDkx9P3l4LyqPHcDZU0etQhVYdXe1s98GrwnmQSq0ifFxDA70obO9BY3nalBXdRJVVBinqCSOsbzjB3bhQuLvEyyvin0vxaLrO9qarHIXGIeY3+VEp3b1dHdA/VV39iTOsd8a6qoskAuYL3fPpccCgUloHLY2neMYPMW8TqKWda2vPcu2DtDD4hhg7EN1EOjWnpk6P/V5gtdefzp39hTqaSw0na+xbby0Tpf7rbZKifYQrDVXlIdkqnroe2NdtZ1L9o+xXC6D8LF7UgLXBeJBArh2ZO45eRY/+2APevqHtTdnwAAAEABJREFU2Kgpq8o4HmgJ3UNLy/Hk2sUQgPPkbXlrMPb2dForb9+297Hzg7ewZ+smnDy0B7UElkZafk3nzuLOp2q01tegvvY0GghyI8ODCF3BqvF6PNYi1yMHNiyei6gID/QIXhHko/QstMpnx7EqbDl4AqKubosgZ5mp5K3J39xQi0O7t2D3lrdxdP921J05gVZacb1drRge6MHIYC9GhpT6+LsX/d3taKe12EDrWIC+b/v77Kd3UV153FrWwUsU3MXVkcLoIHgfI1Dv3fIu9m7bRMV8CI0E2I7WRubdgYHeLgz0d9vUz/HQw+ubzlWj6sQhHN6zBbs+VD130mOom3pmz8UFTH9X22SVStnUnj5GED+B+upKjp1aDPT1Tl919Q8ZFF0drbynBucJ3nUcg2dPHkbtmeOsW/+UwmIWweAkZD2fpBKqOX2U54+hhl7FjSRb16op8O/u6mDu135L3vJopFxOHdlL5XqEfXEUNZWsx5ljOHV0v/VwRgYHIblcLcfwuXtHAtcF4kOjo9h34iz2n6pBDS3wUbq5gnAPASk5PgaiUZ5dv8w+/yQqwnfLWzkxMW7d5GoOuqppV72Z9IkstX5OaFltsp7GRocxRlf4TqbhoSEM0hVVGhketqARpPUn+VxOEMYY+Om5lOVnWmrl4WULEBsdZS/VfcOU9fGz9di055h95srw6Jg9dzf+m2A/N9ISrqdiaiXd0EPaoK+3B4P9/fQ2Bq334LheeCMimaKYIqEdqtqZOkLqZYigIEDsIdh0kLaQlXq28ijv7WccnFbqRY0KUukNk5poJBhXkp5ppEKWpyUPQP2r/Map5KToxlivcaYx0iZjPKb+FoWl63q6O9HZ1kILvhoCvFrSPir/oqIufJWCGh0ZIeD2ob+3F4OkV9Rm1eXCRVf9ErLtGB0ZQj+BX0l1GLF0WsA+B03KmcY4VM+hwX4qu8GpREU/coU0PDSAAXoifaSSLk0D/X22nhprUiJXrd70Scmqkf3Y3tKAIbZRfdjPflR9e7u70UuPpIeeUmd7s+2b6dvCH/e4BGYN4pO0mrQe/L19R3G46jwGRsYQ4DHDBmqVRXlBFjZUzMX6JeWIiYrk0Vv3llUwSS5VA06cd+XRg5Bb3UxXcrC/B5MEd1uaceB6vPARTCIioxAR5b/9ieV4fREAQVl1VFJ9jXFhjKSDK75cx0FctB8rSKk8t4HKLz0FoqR4I+iD43xLO3bSGj/KwHE7KZYrZnQbT6gtowSjOlqnzaSsBgkok5MBVi+EENsX4Y9BXFIqUjKykZqZj7TsfPuZkpGDeB6P8sfCcVxImQkUx5hXW3M96mix9hJoBSwz1VdZE6RQOlqbUUe64OypI+hqb8UYARaQLA08lHVUdCz8sfGIiU9EXEIyYhISEROXAH9MHLy+SF7qIMA6CogtdUDa4SxpmDZ6BeMEfZWDi16qn+O6mJwMYpw03QTHmmHfGDPb6WHg8PogPVXdrxSYpsCMMTDQy4BfOTYjbD2jomMQRdldNk2fi4j0M18P6xWwSVSbkuSvzwAVnsaejCiVcLUkK1zKsYFKsaezw/bf+PiEVcCTbO/o2DhjCOOM4wxZnl5K81I5XS3/8Lm7JwFntkWLOjnDYKb+rFptYwtCHECA4SBzkBofa9c/r5xfDA8HszEGt/IlZdFP7lt895F9O9DRSkuC1pr+DqfKUWkOQTMqKgYJSWlIy8xDZm4Rsu5AymAZqZm5dmKqLjeSslKSsHJeCR5aOs+uJzcEPRD2FJLrHhiGHph1jEB+I3nf7D1B8r0jtKbbSWH0kLIYI8hqcrv0vuIJnsvWPIANjzyD9UyrNz6GVRsegz71e8Njz2HZuoeQmJwKf1SUVVDGEIiZnFCQlnIzBhjsnKljiMdkBZ+kW99cX0frdpKW6xgBJwgvA8KRBL2M7ALMW7IK6x56ChsffwEbn3wRDz3xItbyd8XKdcguKLaAboxBkPkJkIdZ/w6OmWZ6be3NjQSuO7/qx45RUo4ZWXmYX7ECxXMqUDR3IYrKP5lKyitQMm8xCucsQHJaBhWTD4bzCoa5MElh8AOu60FKagZiqNBmZHilzxF6CT30oHq62ugx9tt9CFKsMA6zdextIboKI8MjqKPS66DyDMqT5DF7MvzfPSuBqd6bRfXO1jfbHYVNHT1Tz/hQ53IA5GekYt2iMiydU4iM5EQOCA60WeQ320smJyfITfbgLINjcuf7ab1ZN5Xg4uHEljWWU1iKBUtXYfGq9Vi4fA3KK5ZjzsKldyYtWIKS8kVISkm3TTJG7VeyP2f1n8/rgR4M9sSaCiwpy0dsVARcWoaaVEO0Qo9W10PpXEsHLcXJWeV5qy6SRTlB4B5lPcZprQVpbap1DvveFxGF5NQMCzTxicm0ipOYZB0nQb9T0zORU1CC0vmLUVBajnRZ6bTQk9IyEcfrXYIQLnoNk3YRt9xH2kVUwiStabAwr89Hqz4Zc6f7tJB5ZecXIyM7D+mZOfYzK68Q+cVzec0y9sdCZOYW0OqNlC60Vrk4dkuv0HsbJ/1yUbF35ivHhYA4KTUdxXMXoHDOfBSWLSCYfzJJVpk5+ZCiDBFIobnGpP0GruvAYUpITkNecTnbPMfK5lqN6Kb13UCKapRUX4jKzXVdRNPiz8jJYx5liKTXKlDXfBsh3dPL4Gc3ef4ArfRr5R0+f3clcE0Q16TVeuUTNQ3YcugUBoZHaSMaGGMg8JlflIvHVi5EPsE8muBza5sTskue2ugG15w+gc7WJgQI3gFObi/d6gQCQWZOAcoIErLCFq1Yi3kE8BJZN2XzoMl+u1NByVzkUYnEJybdVNOjoyKxemEpVpQXoSAjBT6fjwAUwjgBtKmjF8cI5Eem/7zbTRV03TeHiCHTSfdqpuuTKUiAGWXsYZD8rDwl8d76Lr51CoQnLTjkFZehoKQcuZRTHuWVUzSHgF5ogT6C1Bezsu9B8r9d5LHHx4YRoPKeJF3nOo71cuTtCMSLCX5pGdmIjYsnHRENS5tFRllrVApF/V06rwIFpXMtSDmuy/EKqK69PV1oaayHuHP9toXewf+MMax3glU6Aums3AJk5RZeSBrLaVRKsXGJEOAPUa7ygoLW6wUEvBEc97HxCcjKL4Lamc3P2LiEK7YiRPCfJEUk5dgoBUY6yaFMNb4SklMsgJfMW4SYmFjoeIh9GqTse6lImxvPc/yNMu+LOp2/wu97SwLOtaozSt5MVviJukbUNrVjdDrAJis4NT4aS+cW4IFl8xmUi7xWVtd5PmQnXgsHkpaxTXBiGwMCCjjYDFLSszCXgL1k9QMoKpuPuIQkDnLPdZZxCy6fniQBAs7N5CYry0fPYsmcIjzD4HBCTPRF2YVw+lwT3t93DH1DwxaULjp5W7+6tJZ9ERFUKpHweryUvWP7Rda53HOtCtr23uvYvWUTDuzaDNFdxw/txenjh1FNxdtE4BAYRfqjkZ1fgrkLlmIe6YQyejCZtJ6jY+Mu1F/A39PdbgFcB40xtq3JaekoohKIjomFgEznrpaSZKUWliEmPgk+Kgk9+iBAjnqUfLwUxRADhgqSXy2Pu3EuQAOlt7sLlccPYu+299DSUGcDjEHW3Uv6yuf1IZZtWrBkNcoXLqMyyLVUC67yCtCS7iEg99CyHujrJiiPcQ6FEEnFJ0WSk1dkvZm4hGTIGndd9W8Ine1taLBLJIfZ32EQv4qI7/qpa4L40Mgodh49TRBpxsj4JMQzqtax/iisq5iDRSV5SI6LmdXk0n3Xl4y1tBJT5DrOoRu6CGULFmPe4pXW+s6nRZdog2fR8BBgjDHXl/2tuvoWlSsg1zJNWeTF2amIjyWQG8dOurbuXvt8dsUlunoHblXNr5mPQ6tNkzsrNx8JScnsZ4ey9sBxjAXbflq38pC01FCBZq0mqa89DQUua04fswHoMycP48zxQ0yHUXXqMMRNy2J3HZf5eTDzEs0xzFhHgApxBjaCVJJR/hgkpqRawDLm2n0sA8MfHWsVe5Tfz7pShlQHsr5l4StQKut0ptx74XNocICgfR6njx2E1nALdIeobIK0wn30yqKio5GVX4i5i5Yhv6iM8kizCsoY56rVH6fl3UAapVscN5UEYOBQ7j7GKDLIzydS4fmpHLOoUNW/xrBfaY2PjQ6TxuyGYiGDF8UtEH7dcxK46giYIG3R2ddPED8DPaAJnAjgIPDSRU1JiMVDyxdibkEOB4XDo7jhV4iDRlzc+Ngo5D4OkZMb7O+HBo9LcE5Nz0YGA4g5dMfFexbS8k7PyoUvMhLDw4PQ2te7lQb6ekn59GOStMcNC+CiGyXX8oJsLCY3npWSCGMcij2IwZEx6G+UHjxdi0b9paSL7rmdX+XWy4rOJyWSSSCPjY9HdEwMASQCjuuAcx4T46MYHOhFPwOfCpx1t7egvbkeLQwkakNK9aljdg3y0f07cHjPNpw8sh+KbwzYlUUTF6o/SatxnHx1IEAI51snguTgvd4IUicxcBxHh2aVHNdlPeMQGelnHQn8Nj/+R6UwOTHOoOnHlzZ+IlPeorZ94vgtPhDk2JeH0EGqUEsvq6jwtHt0ghSIlJmMk5i4OKSmZ1mPc+7CJUhJy2S7oq5ZkwBBe5jKoel8LXoZSwIMXCpfUVBx8clIYcwiOjYWPlI0OQVFEB3l0PPigEOQymOUc0v3armmaBmEX/ekBK46K7r7B3C2vgVnGlrsH/YNccDBOEiIi0ZJdhqWlBVAQDPdshv6UJ7jBMD+nm5oR5/WgJ88vB+H9+2ge74V2nnZVF8HDaZGDsaGczW08iohl33ftvdxN9P+7R/gwE5SCHt3oJWgJQEQI/RxUyku2o/HVy1GeWGOtcJnMhscHsOO6T+4MXPsTnzKjc+i2z2XLvx8uvJa+ROXkAJvhB+O62KS42KctJs+BUpKM/UyBMMQA2lBgnGAFrYAq6u10W6qqdPa7e6OmUv5OQWyAhH+sG/DQ/qifPQ528RiLWARsz52i/IxRmc/dvhjP6bOTv3/sRPX+WNqLEw34Ar3jtNwOVdzBqdJoVRXHsUwPREpsyBl6vN6EUsAz2BAuGLlBhQwoOunV+LMUpkNDQxAa+wHerugxQCTNMpUjVQqBBlCfgY2FaD2eH1WSSjo6tcyTf7WdcOkn+ppxYtP1yql0FSDdCqc7iEJXBXE9Wzrg6fr0D0wjAlOQDu5OAEKs9KgjT1pSfGI8HmvuzkaoJrMsj6qz5zAsYO7bDp99ABq+ft8TaXdmddEPlVuuqy6tqbzmEmtTecgvlBu+d1MTfU1VDy1aJvePDElCE1apalfN/K/NkrNL8rB3PxMZCTFwcvJrHxGRkctrXW2oRVasz9p+0Rnbm+SNR5BblkrcOQJaeWPgsjL1mzEYoJLxfJ10OogHS8pr2BAeR5yCkoZvMxHQko6PaZoC/aq5eTEJAFlhFZ7NxqplHu7OjmspuTl0gr0kDqwIDWNocYYS9todd8ZZh8AABAASURBVEmQikB5zCYFaUkKEMdo2VvwYX7CIGWhcmwZFzKaKh/0NHnZ9NGZY9M/Z/PBun50mYExDowx4H/4+CtESzcIgaMC9nbna1O93YAToPWsWyIifNDywoLSeaQQl0DBXD8pIsd18cn8cNlXd2c7tC5c3m2QYyVEZRogvy6KSt5Ie0sTGmUgMXW0NjPeNQoP5W+MsfVTX41RqSj20cGA8yS9g8sWFD54VyXgXK50Dd8ALYFzzR04eKoGw/ZpeoZjx8DncVCWl4m1i+Ygxh95uduvemyCVrdoknZZY9Wn7Tbfowd24pS2Ip85DoGyONbernYM9HZysneij9bapWmA1oU2+tzV1NcDlT8y1G+BxhjJyGH7DROlyDe/XPfb63GhP7w8h3JWimJgUZnIxW7p7rMB5rrmdowxRqHjtzMpMCaFO8C2ymrUJE9OTUdByRzGJpZbEF9KMFeAeeGytZi3ZCXm0GIvmUcwL1uAnMIyuxHIHx0HDiAIQAIEFO247CBwaCzoGPjy+nyIioqGS6CSBOmGwKEprfJ76akFCHC87JrvmTqLYhsZGUJAyA0DKSPHdeH1+eB6PDYfYww/lfjBa/R/iGgvWQdYT/2+VtL1k6SCBJQz186U5TguHFvG1Bldq7z7GWRsoJUr+qSRnwO93RfqqRiEuOocKsLiuQutUoyS1ew4U5lc43+VMU7lJSUhL3aM1n6ICorNQpDzWgFkPVem7mwlg8/H7OMrpEx6OtoQ4nmlIGUWpCJUm3qpDOQJjysfZXKN8u/o6XBhuOyoCLIjtc37HIHiZG0DRmgBSlYe14OkWD+plHTMK8xFFCeDjs82Kd+OtmboGQ17t7wHAbe2AGvt6iRdvRkrYQb7jNHkmk76zmSMgTH3VnI4uTwEXnklSo4BAgScEC2f2crmctcVZWdgDZWllh/OnDcsq56c+OEztVSut38rfj/BW0+EPLDjQ+z44E1sf+917Nr8No4f2E2Fe872RTQDY1rumZKWgfTMXGTnFxF4yjFnwWIsWrYaK9Y9yGOFtgkUDUIEggD7e5xBt3Hx0wQLHYsiVRCfmGwDp7pY48AYA1mCDTVVGJ8ehzp3tTTAQFxrUwN54C6MDI8QuAJWGURQGfoJhtGkDHzkgZWHMYbnXCoOj20Lq4ZxGhpa0SFLHrN4BQjgun6QsRy1w8AwPxceelAer8/mj+nXJNsrfvro/t04e+IIuhg/sFQHLWT1rdfns2vcF1Bu8xavsDTH9K2z/lAZne3NlFsbRhkcVXs0t1Q3ybSP/Hg9DahzVSehVKdnsJw5xv6socHUSeNgHCFigGQRoCLrIrjLopc8BOqzrkj4wjsiAedypWgnpDaWNLR3o2dwBJMcpLouKjLC8rSFWamIi46E4172dl36saSBMDTQT41/AtXTm3Y6OXgHGBQcI+/GEcNhb5ifB1F0GWWFpJMHVCBTPGBh2TzIrcwvnkPLrvSeTLlFZcgrmoNcpvySucgtKEGkPxoOQRc3+MpOS8LisgLouTQ+r4e5GGhiNRHEj589z2DnKAFK05KnbtNbindsdATdHVPByjZy/210/evrquwqin5ZkBwfCsB5CVg+AqUCZ7ImBZjicD20eo0x7GNWkp/2Cz8FWpKPMYYngJjYeKSkZ8L1+GCMA50LEEz0/JAWUmh61EJDXbUNZIteCUwrSgHLOC3PwYE+tLJuWtpYffoYFNSbugbwuC7iE5KoZHIQGRUFlW0L5X8RDJDHxJK28nllr1oQl4cgr7DW8vadkDcwlVeQMg9gktSCQK2tuQHnqivR3tI4TYcECeAOFFC1ysIbYdshOYrWaCSFpIdtNZOKE/APDw9hkkApKsdLOcUlJCMhKRXRlIXK6Occ6epoxeWS6JJ+yl+WNptx4T1GWUhO3bxPdVbZOil5GmMu1F0LCIY4L5W0U9a2kX3JS2BoiRh2S4AKdowWuOTRRtpQClJ5hdO9IwHnclUZHZvAmXNNaOzswTgtBGlw9if8HOwClbyMVNgBcbmbLzkmjS73TYG/Mwze1FL7iy6ZmBiD3GhjXPgJdnGJSdBOPm14yCYACsDtJ78LHAuK56JozkKUzlt8zyZRCCXli2iBLkXx3AUEpTi4BI9LRDLrnykJsSjJzUB2agJi/aSuDLuLKK7nqJxhwLm7fxDjnHSzzvAGLvR4vHb1wuTkOMbHRiClO0yLUxZk4/lqG3DuIF/a39tDaqkPAgMLCv190DEBVbsFuD5Ag4gwadgODwErKsrPvCPhOC6MMZBFn5yaiej4JPgi/XAdh0orZMsUIJ0+dsju3G1icFt56rkqArIuWortrU1oqq9FDcdX9enjOF971taX2cJ1HZYTAXkKWQzQau24MQYzr+jYWCSlpsFHwAUIcgRVAW4TuWIFHLWSppVgrXJUnlIHjZCWxnMQyOv55qqfQDBI78sYx/a91qt7I3yQwhCYipJqqDsLPcelt6sDssD1DBTNL5Wr6yIoE30f7OulbOtQz6DneXohlybVSTRMK5XqEJUXpl+TkxNUXv20quvoiXRa+Rlj2H6flW98YiJi4xMhJeGPicfFKTqW4ywhEfKGpIAd1+X9YApaWTZRAak/Q2zjdHHhj3tAAs7l6jBCd/IEaZSWjm5MDXVjP6MjPKgoyUcOLcTL3XfpMQG4XDn9kYYje7fbHZfDgwOQpe86ztTAosWRV1yOpasfwMbHn8XqjY+jfNEyBnKyEKDrKQtA2l8uq1z2Alq593KSt5BXVIqs3ALIGjWc0JfKZba/XcehxxOF+YU55MiToEkOTqARxijaewcgb0lAPtv8buQ6f0yMXZPs+vxwHC8cY2z/jY9PYKCvD4fZr7s3v2M3pxzZtx3HD+7GsUN77Kaffdvex64P38GhPdvRQgtZFiF1EK1ih4rbT6s4G3HxCTDG2Kq5BPZY/p67cDHSs3LsMYG9vozRuuzv67KB773b3yet8xq2vPPqVHr3VWxl2smyzhw/ZGkEjb0QFYbu9/v9duNPWlYeRPV4fRHK8kJKTEpDTn4xXCostc9Lakx1HRzoJZDWYD+ppO2kkTa//TI2v/0Ktrz9Krax7G2bXocesdvZ1gRRPQYGsvgDNHzik1KQz3EghaGCArTcO9taYblvKkQ9gyZAZaFzrCZU3ujICFrt5rYDOLh7M2W4zT7y99j+7bg0naScTzOOdPr4Ybsxx+bD/wYI/vKUhlh3eSeqi9qTlJIGbYpbtuZBrHzgUazccPm0Yv0jWL7uYeTRaIoiveWld8JsqXBGrCy6aN1PEB/CQC6p3BvpEyCuTh8kj1jd0IL2nj6OrxDASRYdFYGM5AQUkEpJjIvBtV8hjNFy09PvGmgV9XS2YYiR7gBdYA2MOLq2+Rwo4v5K5y1CbkEJgTsbCRz8Xrrlo6RZejhgOujCtTedt1aW7hcw3g9Jk9dxXIrOXFtUV7jCGEPvJwLzi3KRlZKAkBCQPRLg5xCBvNquUum7wt235rCHwKYnBBaR0krT2vyIKHg9HmvdQgqFnGtPZyvams9Bm32app/jLrqglRRIF7nZYVruQXoMiql4CJCRDF5OPftjDhVE6oWKGmMQQW8vK6eAgEMKjWXG02r0kaJxHVrlwUmMjQ5DwWTxyipX+WucKPA9RC58hPVRWV6W49KSjImLJ8dcSO9oCRVrIbRT0WFeFwrllyh/NFIzslnmfGjbu1bieL0emaAYJ5WgZ4nYNfC0+LUGvruj2SoKPdFRa6knaWy4rsOAqRf+mFgCYJkdzwJOj4f5QFmFMMEYQJDj3zUOwV7JtbKUPJWkAEJs4zjH/jBpDsltmEbPZRPbOTI8gCGeH2e+GhsBKgWt+FIMY2J81PaR2mEcF8mMV+hxFLkMNOfklyCnoPiySfMwt7AEeUwyRKIpG9XNAAjSyu/lPG6mBzJBIOeh8PsekIBzaR3GaDH0DAyhoa0LvfqjDwQMIhESCNz5mSlIS0qwwHLpfZf+Vif39XQx+n0crQRhWSri1l2vl9ZXop1YZfMrMH/JSuQWliIhOZWTIIJFGUxwUgxxEHcTxLto5bTTlW2kC62ATJAc6aVlfZp/R/q8mJufTUs8EcQJaDKpvWMMDE4p2n79vG3JGIMov98+qEkekDjrxOQUxJJDjiS3LIAFx8goFfQA+VmBaV9XO6mUTowSZILBCdIUXvijoxEbFw95UykZWcjIK7IgEpeQjItfLoPncufzqeDLFy5DVm6hpUFEA8gyFMh7OYYcAnGISiRE4AqRt3Udh56dl2PIZ+sbF59on56oNdb5JeXQ83VS0zNhjLm4OPvd6/PZepVyPCoGk5KWhcSkFMQQkAXoaqPqRRijxTzJFABMyJYlZR0RGcW2JSAxOQ3p2XlWYWQXFFlAdwig0IvlulSIul7yjI6OQTTzvzjFkNZRmaIypOiunvxUeFFscwRcKiv1gZSJng8jqsel8lB+krmUcGpGDnIJ3ImcZ/GkLuMZQL5SSkhMgWhNeRIJvFb1Uf/5o/0YGR6kwm6E5reaFU53XwLOpVXoHxpBc0cPegaGIUDX4DAwSE9KQGluJgQql95zud/dnMiyCPqouUc4wSeoxT20jjRwcmgNLFy2hpO4xA5ChxPw4jx8vkgbFNRzW4aGR6HlaKO06kdphY0xyBb8JQJyn9eDXCrPjOR4REd44biOFdXY2Di0zLCr9/aCuApzHBcxcXEombsQKx94HAuXr0NB2QKkZuYgjmDg88fAeCIQIgCHjAchxwPj+OB6IxERGUOOO9FeW1A2H4tWrMeyNQ9hweIVBLE4OI5REZ9I0bGxHB/FWC73fv2jmL9kFXKo7JNSsxAdlwgfuWMP83c8KscHHxWKPzYeiUnpyMorRtmCpVjFui5b86BVQFG0KI0zJbtPFMYDrseLJFIOcxbyvgefYBvXso3z7fLIOCqaSLbRw3GpoKvHGwFfhN+CdAKDkBk5BdCTGpeyrJXrH0N+cRmVXAJz/ejtUjbxBMTk9CykZhUgI6eI9fx40iaqj1IhMqnArpTSswuQmp3PPAqtURSkIh0n5eSnl5PJ42lZ+UhnvTTX9KwaPSdFuzGNuby8P6rp1DfRWllUtBmUZVZ+MTL5PTUzDzGMV3goqxA9whDLnLo6/P/dlMAnRnUPg2WywkcnaHGQSZmqXAgpCbEoyk5HBEFl6tjl/1fHjtO9a29pgrhwLbsK0lLykCKJiU1ANgeFwEDPQ4mgBeNcZmJF0KWOjomD62q1gKHlw4rQ6hqmW67ASoAK4fKlf/qOuo6DOH8U0hPjkZGUAK/XC3AiKiDWzJhFJ7lxKVvJHbfpZYyBSxDyx8RAwcEcUl9yzedVrLRgt3jFOixeuZ5pA9PUZwV/X0gE/fKKFdA9eUVlkDUfbfvXA+DyoKLyIgnUcQS+9KxcyDIvm7+EYL4SFSxvyUqWtYqJ5Sy2nw/YskXPCYi1oikrtwCyPAXgjuviai9jDDx2jMZDFnsuFUZ04AStAAAQAElEQVTJ3EWYv3glFc9a5q2yLkq2zA2QMaIYTiEVlC0vJRWRBFKXlvDF5el3Aq17yU6AP5fKQvW80VS2YAnluQgFxXMYiEyCw/r7SDulZ+fC5s3zklfpvArIg4qnsjXm8rK+uJ4z3wXUsXEJvLfcKqg5lL0WFRRNt9NHhYbw656QgHNpLXpIoTSSSpmY1J8kmOp0/a9lbqJTfAKRS2+66HeAnJ+CkZ1tzWhracTYyCjAwSMuMiUjm1xbKXLp1vkuCS7hopfOaZJHRcfCR1fXcYwdpDZoQ2pFFsfVQAufopcxBj4qzpSEOGSnpfC7z7ZuknIWgHf1DULeipbi2RO38T9jHHjZbwLGHFpnpYxlzCc4L1q+hiC3HksIqEsIblOf6+0xnZu/ZCVKyxfZ4KGs3UiCM2b5kpKXO59CCzafgDWH4LRw6WoL5FZxrFrPcjbY3wuXroEF1NJyCPijY+MtMM+yKHuZyvNFRBL805DDcVpKELRAzjZOtYtAzjKlSCyAVyxH0ZwFkKUbG58IgZ8xmjH42MulEomNT0AG6RaBamFZOYrI+d9oKmQb84vm2HJj2E7jOPR6oiBuv5D5FpbOswCcS2WUSvpKMvxYha7xwxiOO8pBikkrwwpYnpL6QG2VwjDGXCOX8Ok7IQHn0kL6BofR0tmDCQaidE795CGIJsVGIyMlEV5SIjp+pTTBgEdTfR050S54OLCmrjOQO1o2fzHSplcdTB2//P92QNI9Tk3PoKuYANdxaY0H0cXAkjYdDNEiD0zX7/I5fPqOJlL+OWlJ8HlkvZKdJaU0Qkqlm55TB63xyYCU7t1pt8Bd4Oe4Lhx3OrHPHI4bY27PRFd5LssSaOpTv29n65W/47pwKX+XXol+G3N72nY72xHO+9MnAefSJvUPDaOtuw8TEwGAY9TlwI2LjkISA5sCEtf9xC2Yeck6Hmc0v625EX093aTTg9D1skAU9U9KTWfQKXrm8it+GmMQMW0FxNENDJJKCQZDGCcfrvW1WpurzUJBAtkVM/mUnYiP9SMrNZGWngsKlu8Q9LC/AcYMOsmLTzLAd7earLXJilUM9vex37sgymsqddrfQ1pBwXEhWo0Vv+lqapxJiQfojQTYbiUFzfWpc9dbgO4JcSzZxLEWukKi4Jl16EL66Dod4+FZvEPkkUNXyP/Kx8lA875ZZD+rS0LMS7KyfTbQZ9eTq7+6O9tt3/V2d0F9qfO6TtfPKuPLXKQ5OjExbgOiA309nyhL5fb39mB4aADjpGGD7M/LZDPrQ6prgONCddfiCC2uUBlqm1JvT5dt2+jICDSGZp3xNS+8exc4FxctAQyS/ujq68cEBaFzHloeMwDuJ1ftOB+7RZdcSBKeNjBoE8Zgfz8CRBljDMQFZuUVQi6dSyvmwg1X+SJ+Uq6nuHMFlIwRNx60na2HZDWdr4HWj0/Q8tfku0pWn4pT8dF+pCcn0BOS/KdAwxgHgyNj6JQlPkmle4daqnGiiakdi/2cgOpvrW/WZpCGc9X2oUvymJQaz9WguaEO7a1N0CTq7+/F6MgwBPzK53qrLLAeGR4i2LRD5U6lFnR1tBIgOiAjQsAxm3xVviayAKSnu4N53ngS8AmklJfG5KV1+FhZXddXTndnB9vWaRWixvzI8CAuV8bV2qz6aPWKFhmoz7rp1Wq3aTO9Zu3urK89a/tt5rOJfdZK6lLX6XrdNzkxYT3iq5WjcwLicQZZBaK9lKuo1ZbG8/aBZxoTM2XU11bZMhs5l1sazqODcTQB7uD0GFHfKL9rJclW43GE40J9oDq3k8rVuLNtq5tqm8purKu2y5XbmurtmFHbNI51v/K5Vln34nkhgq2XGjDOTtIfgRgYHoE6Qie0djUhNgbRUZFw5B7r4BWStkJPdcAQJql97cAht66AZjppFK93is+9wu0fOyxl4WfwKyMrD7mFJYiOibHnVcZAbze081MbS7q72jA+MWbPfZr/i4r0IZHWuIfKDBbDDZtrMEQQ7+4bwOQdolM0TjS59EcGtPNw77b3sP2917F102vYveUd6Bkrh/dshdKh3Vuwb8f72PHeG9j6zqvY/v4bOLR7G/uu0gJSYNpQYENm/e63fX8K+7az3E2vY8s7r2Dzu69i27uvYf/2D+3297HR4VnlpzEupVJ18ijr9ia2qh3vvo6t15G2vPMar38NO9g2PZb49IlDkJeolVQXV2KmrDMnjmLbJsqDdZ9NOcp/26ZXsY112731XRzeuw1nK49BwDhuvZvZ0Wi6Vsqg6tRRHNj1oc1vC/ts5+a3cWDnhzi8ZwuT+m2L/b3rw7exjedV7oFdm6H7ummpK5+L23W573qUQGtzPU4c3o09rLM2YikffT+4i+Xs3Qq1Q0ljZO/WTdD5LezHnSz38J7tOE+AV99cLv9Lj8kg6KJS0k5d1XX7++xD1n37+29i/84PcJjj8PD0mNTvXZvfYZ+9im3sA41f/f3ervZWYtYEHUU7uS4t4p7+fQHEg6QrtKRvkO75EK3xIN1L1dx1XCTE+OEniAg2dOxKaYx0xyBd6lAwAGMMXPLnEeS2Y+Li7Tpal9QMZvkyxkDXayVDIYM0WoMb5Y/mMQdjdLt6aJ3or8icOLTX/sUYafPe7k66bVIgE/QCArQalIL8vPEk0GLP4m6/oiJ8iI/xI5JBTpfKFIY1YhIvrj/ZdicCmxNUzH2kyapOHYHAqq7qJK3sWvvMaq3hH6QFNTzYB60iUhpi7GKIx6x1RABoJ83WdL4a1bz/5OF9OHe20oI5WzKrd5BjUpNV97XTahNYCsy6GETv7qA13tZkJ3+PHm87ixxF003QYuynYuhsbaQl2Egl0GCTfncyv67ppO9XSh28t7XpvN3ReL6q0u7i1AY3tV/grap8VFYXlHcHLcV2bWRjUr4z5Vz62d3ejE62T9fq8csa83VnTkLPXzl19ADaaS3LAlUZl0tTANeKGt5z4vBe2D47zz5rbUIvPQJtWLq4z6b6rY+UQ48930EPSpu4dJ/uVz6dArzLrBCTcu9hnufOnrIPt9PqtNbGegggVY7GhzZq6bvGhD7tsYFelteLns42tBH8G+nNaYzUUFk10VOY4Hy/XNs0N7t5T3XlcZw+dgD6S1LNahvHRm9XO/PswTDpIrVpJg3xt8rt7em047a5odbK5Mzxg6g6cRiq//gVyrtcHe6FYx+BOHmykbEJ+2Q8besOEtRl8bmugziBB0HkWhXWDs0h8p+6Tvd5PF5Ex8YhOibWRs4VsMR1vuISkuwqgQwtF0tJhVa5qF6ydLroQp8+fggazNXs8Hq6hHoAUgcHvc51Ezh6lNihPdeZujk4lHo4KPsIXAN9vZDbNc5JHyBvpwF0nU25qcsjfF7E+qMQGeGFh8oRFsWBUQLrgDwnAhxu4ytEHndwoJ+gXWflLetFO/c0GfVXjYwx8Pp80AYgf3S0pc6iovzQSg+Xylv3S8nLvdbDs04f46Q5eYSTtgE6fi1KLMj26bqu9hao3BFSCvL2tNxUW9r1XcfkMusagVeIY/paIgkEJ2mBjUPxFiWVoc8JeneByXEECVYBJn1eLk3yOl2vsvsIDALzswSDc1RQXe1tEP0zU4eZsjRPxugt6D4l5REM0ApkXUKXJB0PsI9ndnH2cjw219fSMj6Ck0cIyixHYzRAr+bS9gYY/Nd8bCAoVp08jNMEqpaGc+in0pokUMkW8Hq9dm5G+WOm+oyfmmMeHmeXQtfpet2nPtMfaRHIKl+VOdM2xQsEfqJN9FhbzcfO1mYMEw/Ut4pxxdCzVnwsNj4RcUz6jI1PgI5HkaqVsTQ6MkQgbUMDLXGBeB0VguZdkIbhR2UBUo7Ku5kgf4btEgA3k7rrJ+etOWo4P3wcjxGRUTYOJyo3ikag2ub1+WDbxr7T+G0mdXTW/vWpA2hkHprrQY63i8u7l787M5XTABifmMTo+CTpCa0Rn3LTHMdBbHQkZrPJZ2J8wvKdIU54YwytZpcDIxZeBilxgy9jDPwcWFpnXFg2H/FJKewUP6kdx1rbk6SAegnQ4snlFsq13/zOK9bN3koXfivdKutyv023+zrSFt5rE128HZvfwkG6ZFUEHSkJDZ473ck+j8dSWpEcgB7HvSDNcQagh0fH6W3cPjdQ/TnB2IMm1rEDO6EdmaMMDGnDkeQQolZ1XBfaGZiSnoOs/FLkFJbZzSbxyWlwvRG2v9iVGOcYmeA4GyMVIB5dD3hqpPU0TlC50KjLfJngeQFEL0EswMmnsiepTHVpiGCt1VRD5ER7qLS76Fr3cTJ/HGR05SeTMQ6xI0SwDUD5Cfjk1YR43HG9cHysu9cH5xOJ52ikhOBgkgAjOdh2UU4wIBC1W69gnO2cKdUwT9U1wPiFksoLsu4qx/VFwhPp/0RyvZEwjgeyqVRGgLTZ6Ng4xmlMDNGwqDy2H+drTkMK9lKgG6TV2UTZSqm00wua5FwZ430B1tc4DgzbFxUTj5T0bGTlFSO7oAza2JPM334e13ldp+t1n+7voNdx9qK/kzrTtiArKN68lha/PCSKABMsb5JtVfuSUjJRNGchFq/ciJUbHsOqjU9gBT8rVj6AorkLkZSaCcfDdjKfSfar7utlHzZTYXXRWNPjqmfK0ucovf4qUkPyEOSFjY6OYpxlTVCZGRbu4TxRG9SWTPunHcuQmV+M5IxsO04dypTDFiGWp7E0yjiNDIxjB3dTnlXQDvPgfQLkjgSiJAgIsNJKGlg6puRQXSug6fN69POqKcTBEaQQwYFJOcJxHFpiEZBFftUbr3HScV1q7gRy46WYu2g5tGFEwVKXQVKP60CWkgaQXDNRKt109+SCdtAVbKfbqs8bTrxfYNNEa0YDpvLofvtXiM5WHrXumMBFE/MaTbjp065DWbIPLljiGqkchQKvUXpQF/fZTRd2SQYTBN5Wuu2SZX9vFymrYcp80vavFHRmTgEWLF2NRcvXYt7iFdBS0qkNLcuwYMkqTtx1yC+eYyk1Ly08h3UPcqzJGm1jvudrztg8deySou3PEI0CTVprZXNCBznJjTGQVRVDqi6CFr/r8WrY0UKbRDdBXIpBVInN4Cr/GZ4LcbxeSDwg70H11R+4sOveV21gGz5KU8cegP4QxqJla1BMcIqMigZYJ2YFtUPWoxTJJK1o5Q2+mDXrSJXHizTfeMhawfklczGfcprKdwMu/tRGpooVa+3697SsPHgjqFQ4FoIEc9GKI1RcGuuylCekQJQpk+rQ0dbC+MMpS1nJ+p+RWzQt4szcAixcugoV6rMlK+2jAvQYDK3Dn8/f6ssF/MzIzoU/OpZNM2xXwHpNffRM60gbdXKeqRwWB7Vzps36FI4ABrLoY+MTUVK+0KbcolJkE0yz84rsvgHN5RKCuMaLxlFMXJwdV8RWqwQErvrTjVowgenXGBWj5nkj52QHve7h4WFbN8nZ64tAZl4h5i5chooV6zF/Mdu2cOnUhqUFS+3vMQqrlwAAEABJREFUhcvWsu2rkcXr7NghvgQ4pkbpHQ319ZBWa4AefXyxPKeLvic/LoA4RxffUwPsQk056vQ3+PwRPvgIIBeOX+GLhKjE2+wVxhhocjkcdLiJlzGGHesiNT3LAkRJ+SJkcxBo40hsfALEuxt2hFE5nCBBKpIArQAB7MT4KCZoxU3SeruupHuY9PhVPVi/T65y4zlUnz6GE4f22L9IVF9Tha6Odut9aBDgNr4cx8DLNkb4vPB43AslqVwBueR+4eAt/jJOGcqi6yHFFCS1YMtjGT4CSkJSKuQhVaxYZyeINsdoM0t+URnBbb4FH+3oFLCnZRIQ6NK6tLiMMRxvQC9de1nYUsJBTiRm+4n3BMFJbq+u66V1FuAMd3i/+j4tKxeJyen0zmLgug6McSB+volu8TAplyvl+YlCeMAYA/2LZBynkMAqELMbiuwmpvUE16mkY1NA+wDBfT0BYwmiY+OhdqleQdZPlvIYrUX1z5X6xhgDlVVQXIb5FcuxmKBzaVrCslWeQFUbfBLp2Uju4L0BArlhvfsoE60mUZmgYg9SQY5z7HYQxEWlaDGALE7d4/P5kJyWQat4PpSn/qxe2bwKFJTOtYpWfaffC6lUpKAK6P1qabDX54PuVz7awNd4vsYGcCfYNyGWFyB1M05wFcCKypKSMcZwrHrhZ5+nZeXYcmOpdP2k26KYomNjkUDPOotgqkc3F5aVIyu30F6nMtVW7RoNUolf3I8aK11UIN1U6AP9/ZAHBBhrMMYnJtnxOKWIVhMvKuwfKNF4VJ+qbQuWrkTFynUcnwuQnJKGCI5jKVX9Obog6ayeLtI5HD+a+1fqO9xDL+dadXF4hc/nQhbvta615yUN+0XDiV/YAdPf+OPm3z5q2pyCEqtlV218nBp2CdIy8xBN909WnnEEDh9VQp1wQ4mTgSoNxhjwP+ilCRmgyyZXq4sWgDhGRdeb6PKJYtE1tzMZw0lBoHLYxttZzsV5S3aaqJ0EhL7eHsjNpUSsSKL8fpTTyikomWOtbMd1L77VfnccBz7yktlUurLy/HEJ8LAPHY8X4DldFKQHpz+jNk7g0e9Lk4BbluY4LaUQr5V7H6SyTs3Ihp4LUjJ3PlJSSduw/EkqcD3qoXuaVhGQX5rftX4b48Dr9VkAchyXysHziaTjDuvvj4lFIhVZFIHK6/FBxzD9kuymv97whwwTyU9LbYtpsc6jZemftoyNMZik4hscGIAs03Eq2yAVSIAyELAPM2AYIMiK1lAFfATiaIJoLudP2bzFiJXicT069YnkUtGKt1b/5haWwh8TB6+PQM4rJ+hdCLAVtJZnFmAdVE/HdeGwTgDnIEDrOEj6bAx9fd00fo5Dz1JqJ0/e3dlBXr7H/hENWdqy4n0cE8VzFmDF+kfw4JOfwWPPfQEPP/M5rH7wSYLwPMQlJDLHqbeWWXZy/oWoPGx5HAvCp5TUDAvg2mGqh3gZ40zdcMn/Dvs0hnKQBySaNop0rfIxxkDju5fjvIP5j1IJq4xLbr/nfl6+lR+rpoExhkeU+HGVt8NB7bgfTWQJQJ09SS19lduu65RhGREEhfjEZGRk59kO1kSWtVKxcgPkKkkLl9Oyuem0aBmK59Lqp/uXmJJBTe+3k1niGCUnrInSxmj66eOHoWCdrEUN6AsNug1fjLl2P9zKYgMEBFmU+us6arNAQv0sykF/RCCNQBoXnwRNemMuXzddHxUdQ2WbTdBdTgW8DrIw5e6q38pJkWmSeggcF9ddICgLTJxofd1Z6/HIfPeRktEklKWm8rNoycUxAA6ofAIIJ7cCZFrJIY4c1/lSmVIqCt4NaYXNVVIvOXpZhaPkVK0FSkAxxlh5yKhQ241RvXDF10cmxycvMcZAeUipSEap6ZmIJgBFMBDoOuTzCdqaY7JOZXEHONdUf/Hh6jdjQhQZS2AVZMGnpGVCCsHP/rhanxljbBv8VBhJKelIYbkRAnHmo35hppZaUTkBgrjH46VX4bd8s18KzTulHHRuhB6RqA/FlE7Siz3KuIpdXrhnKw7tZtqzDTpWXXkc8rYGensxQeUTSZosiZay+trr82HmNUIKqY8enORtj7GuqpPGQBYt+ZjYOHg4Ruy5y/xnjLHzWFa+vBLdp7Jc10GQRqfkNsSA7Nh0n+Ief80CxDUI1AoOBH1cJbnsSA0UUEgcywjSapLAxU1KyFe59bpPuZzwGmACcvFteo7FEoK43FyBQ8XyddZd1OeNJimEeeR4S8orkEt6II2ue0KyAqvRCLKBE6Rshgb6cY4RdHGECnpqAIQIItfdoFnewGJneeWtuUygIHBQUnvVj45j6IJGWe8nmtac7fNrFOdSuWsyzl2wxNIG6qelqzdg6eqNljdPoDXrpTV2cTaSoyzprvY2tDIwN0p3Xefl/gqM1BfRsbFITk2npZYMHwODLi1Lw/qJQmtiUK+L/Pgk+0n11r1XTdPCnaCl2dnWCln/zfV1uDQ18ZhNzP8c+Xxx+oP9fbTiJiBwk3zE10cTTDROjTFXLVb3XHt2wXoHUobRlHkEDRmVo/vUR5pjAvMAlW6Q40+gPsl2GMOymQwMvJyfybRWdf/VK/TxswJF3efx+piLAf+DZKz8FXAMcZ6rnfJK0jJzkMg5EkklI4OLAoFWL3W3t9gVJwJyxZUE5sf278KRfTtwmCCudGT/Dpw6sp9W+zEGF0+jgzGtoaEBhKiobKGYek0wsDs8NIgAlYfyN6yQLvFT3gJll+2cuvLq/wvoJc9YWvnypBzHgcbJR/IcYxmTV8/kHjjrXKsOVEwQ5xQg/3atazWZ1ZHsYQQ4kMYZEOtnBF0TMcjfEtC18rjR8+oAHwdODAd4YnKqtTakxWV13GjSgMiktV88Zz4qGABa9/BT5NLWM4pfjAiWpQE01a4gLYhzdgBqudc4J8+NtuNa94Ukx+BFV3EWhzSCLzp0K79qogjUgpyoVOckmQBjCAg+HxSLcAiYmOXLGMe65JKdLJ8Igm4EwUjjRiBvjMHFr3HSKwJQPaPchAIMWgYheXu8EeRvyyx4z+SpvsotKEYU+WxVUvfK7ZYlrj7RxLw478t9pyihMaogmlY+7N+52W4C0qaRi9OO99+E0s4P38LRfdtxvvY0vYQhOKy/ZzpeIQWTQw9OHsvlyrrRY4pRRUREWkvTGMlLvQLIqAhMA7jaMEFL9mIP2LaNhSoQ7aEBxK+zfnsI3pHsJ7A45QN9AcvkWAwQSHXMGMO4RDTmLlxiFx6IflE5XpblpVWs+amx4roOPFToLo+7/HToKQRZb/HPI7R+e7vaqTzrUHP6KMF9K7R5TNTJxLQCB19BgpLGgdrJnzCOgUvl7WU9fTQEVA5m+ZI81Uce1tEYNnD6Pn0LsRyNpelD9+zHRyDOWhsYXNQOqAFBWiejBOMJcsHXakUkJ6VA1BgHErImvoQvvniwv5fHAtfK4qbOO44DDQ51yFTyweu9uaQOlpaWFZlE3lUTU5Z5Ka1zWScSUoiDWRa4liidrz5tV0fcVEMuc7P6YZITZnRiEvqcucRxHU5oDz7Wb7h1L2MMHMrVGIOZlyZtkKCuyafvM8ev9akxIYte3pm2p9vEiavfk7SWdX4mD+Wv4w3nqq08FShzWAeBkCzJRAb4pAB0X4BjU65xOj0lnZcwQhy3Qcqri8Ev5TFOvngm76t96r4Q+1P8+8hQ/9RmkYG+j30OkWvWppW+nm7095HbHRyk0RKwSk3KJL+kHAVM8hI1/q5W3vWeE2QHCS62njM3s2uMMWy2wzR18NI+mzrK0cq2ha5T6YfY1wJr4cFMPvpkiSzP6KtNAu0EBirVfnmxosrmkpIsYJA4I7uAAcssJLDf9DykaMaw7MoQjw/MZEpBE8wVGB2iPPtIqUj5dtIaF5XW092JmZcxhreYmZ9sVAiSSdC2LUhF/NGpa30LsVG6T/dLplPXT+fNcqZ+39v/OzPVMzCcrEoOjDGYeamBWoesNZgzx670qUklsPMQOB3HpXD55gAQgHdNu7VXuvdeP26MgUttbwdp0RxocGYzWBfFKLsxjhoKcWjnaugGMigivu6jQYGbfgXoCY0R6EbpSk4SnKZGqoEsnQifF8Z81Gc3XdhFGajNXq8PHrbdIZjrlNo1QW9jlIFGgWiIk0fHr5bsPbSsOxkgbWk8ZymKpvN1EC3R1twAAbqWis7kMT42hn7ynm1NDRD/Kc/OGAMPXWWNL5XfPx2A6qC8xUmrrjNKxYDcOCeoAn6N52swTGURIEjM5H+lT2MM1M4o8rExMXGIjY//RIqJiYUsU10XJCAG2X6V54+ORVpWHvSs7zyOEY0VlxYnZvEys7hGMgyQ8x5nwM3K3TbW0ANw4LguPLQmHc47h/3kjYjgbw+mXvZCDpkQpBgnaKVPHZ/d/+oL9c+FfqaCZGZTZbI/jDGQDAIal8wyifRWSfkizGMQVvGOknkVNuCYVzyXXmwpsvKKkZFbwBhJLuxfUUpOR1xiEkRtOBxnGt/y4ic1xiyfXoOLQdx1HTvupdTBl+Si8sdprat9F+rJc1d76z7VWQaYZKJm6XrjGDiuC8dxYShL3OMvZ6Z+xhh4vR5EMPm8Lowx9pSEMzg8Av1hV3vgKv95fV7ypHHkxFIZzY6B6zoUhIMeRqP1IJpxTmJ8Cl4er9cud8ynhVFQMs+2VQNgZHQUvV2d1nJU0DMwC9CYrTgmOEGGR8cxygl4sZvsY39FR0VYOc82r+u5TiAkiynS74ePYM7xba0mcaH6i+xDDPrNhj4KsP59BF0FtPRcDlEROz94E/pUcKuD4D5G4J6pm6wwge8kLegQLU/dr8k9woCy+PFdm9/Fh2/9AlN/vPhlbN30Gg7t3Y6Bvl7rqWjcSk6jI0MY6O2yD+Aa7O+fyf6qn16fDynpWTYOUli2wAJQYen8qc85C5CVX0K6Lh0RBEpHAmFuHo51eQNpGTn2WeYxcXE8Oru3MVNz7VpXC9TEdfdTuY0Q3II0kIwxsH3ki2R9Iu13x3Hgj47hfI5AkAOTb+glxdfR1owBehL6PdskWqqjtZm0Kjn/6ZtCzNTr800BL8sTEEphtjHQ31JfC+2tGGA9vT4f5JGUzl8ErUtfumoDVqx7CGsffAIPPP4cNj75Ah588gWsffhpu9IsiUFUx3Et/khxKw7S39dtDSSVqeJ93ki2L/aCkgpRWetx2cP0nDrbWyEDStddK0khjjJI2tvdheGhIWjMGOPA43ohJSij1KVSwT3+cmbqZ4xBlM8Lf2QEouzg5CmOLQlSzxgfoQWIa7wkgAjydel0a+MYLDDGMDAQxCDd0Y62JsgKG2ag4hrZYIhWUxuts/raKoieaDx3FtpKPUKBX+veO3HeGAOvzzcF5MVzbETe4/WC4kIoOAltTmhvacYkLedbVZ8xUlpSpuoHgRk4cJW3dtLGRnHyToOJjt3K5HCC+jgetIwuhoEjlxaKgEGgKkCpqzqFtqZ6jMt5Yw4AABAASURBVBOAZybZpeUHaan2dLbbwFY3PbK+nk6Iihjo74EAYphBKk0W5a08BDZdpEGaGDgcGRm2k0t5OpS7EaDTQhvkxO5XPt0dEGeu71pSF2JZ9jpeq7xUT03UxnM1tOY6lM1VkzEGPl8EtBmmoLQc2oiiv/BTrM0qcxfZ31oqqePaoer1+uA6js1TbRFITtBYUdn24Cz+k7VnjEbP5S+W/KQ0WxrPo/bsSVI7Axxbk5RLCI5jGAeItmPQx7nnOC5kzcYnJCHSHwNjHLjsM9VHfdRDzlkAqyC8jCodv1ypOq7rdZ2SqMIxWrogeCs/lRFJRRHHee4S6DQ3RX2cZ5BfD0arOnEI1ZVHoR2cLY31cHlNNMdPTFw8PZtExLF+CYnJkNWekpFlgT6vsBTxiSm2OgaGRYXYxqBVHoGLDCJ/bCySUtKgOsjHYJWgMdnT0Y56esLCGdXHZnSZ/9Q29VFbSwPqWN8h4tMkx5Tk7DoODdEYaImivC13OsZxmWzumUPOTE0cDiIBQjQBwU8gd9gYnRNg9A4OQVagfl8reX1TmjchKRWO41rhjtL90waMRrq1PbTK1SES5JXy0lK9BnKhNaePcyAcQd2ZE9BAkkt8pXvuxnFtNpGVEU+eTxPG5WRxKDfRR+0tjZig1Xyr6jU6NoG+wRFa4hNWMVoM5wiOorzjoqPgOhe68lYVafMxxlhQS83M5sRLhNpodIYzR1audrFqdUYnLbx+Wl7qI00g0RsC+cH+PggAmuprcJ4TbIwUTIgUhLJQXpEEHn9MLKJjYyFlIR57iBZzFy0qAaK2U2tyGaN6+BDBsRkR4YOP7fZRcV6cvPwdSYUTQRAW7YJpIBgjqDaTwummAtHkvdLYM8a2DB6vj/xtJrSDMDu/CEqKhehTFJo43iIGu7XsThav6yoGFGI7O6Ex3kmvQjLALF5qm5TMAIFE8rs09fV0wQIvFaUAR6AouYeorKTIFZiLodUvMJT8HI4Dl+NQCiY2PpEWawy8lItaNs7xKE+lueEcpHxVT821j/UZDSX91vHO9mZed9IG7QcH+jEho4QZeX1e+AnIsfFJVB7xcFyXSmUc/YwPNHLearVWbdVJ1HL+Vp08jLOnjrENHdNUzhgt5UmOYSZ6ErYdHMeqd6Q/2hpHapeSYf8Z48BxXBjjYOYVS0Ug4I+IiOJ49MBhm4McU72UlTz++roqel6Ntj4yCNUXkpk+9bufHmFHewvH4xlYedo/6B2wU8p1HcRTwWjpqjxQx3Fnir1nPy9IxnEMIjgxYvyRiPFLOFOVF4j39A9i6smGlPY1muLhgEmlZpWmlKb2MU/lrXW31exMdfIQB0SQHXilrIbooncQBDtb6tFJbdnZ2ggtURqhC3mle+7WcS8BIyunAIlJyRAGBMhdD9Kt6+3p4KAfozURvCVVG6Gl2zswhElmF4JhniGbpHAT42I5mKf6iwdv+VvgkFtQjITkVDvQvaRwVMgYvTP1VTUn667Nb+Pwnu2oPH4IdWcrUUsLverUUehxwTs/eBsnDu2zS8ZGhocxSWpF93s5+VPSMiALTGCoCTNOwBUQyrp2WFqQYEV9wfZ5EE1QiqdxoOCYPmP5/eKkYwm00GI5CS0gcCwyC3oJ4xjhmOrubIUUg6wulX+lJJAXP3+lMWrY0ZHkzIvK5ltvTPkE6SEIeMappKpPn4DoBx2/YmKj1DZ5IWeOH8HBnVuwa8u7n0g7P3wb2997A9veew1VJ49ikEpxjGNB+bqOA+UhqzGvsISKLVKHYYyBlFgaFW9B6Tz4SYW5rmOP6/puejlnCK67t7yD/bs2o/LYQejphOozfeq3Vubo/JmTR+xz4HWfMQau40KB/kIGbtM4z11a2MYYRNEqlxU9xsC7xuo4P+U59hEw2zmPtcu5uvIYwbUZA/SipBSUBPxSFudrqnD8wG60UdkaAMRkGGKSz+edUvCRkbb+4CsqOhYpaZlIYhKgR/h8nGchKoYABqkM9bTFfds/wL4dH7JtB6DxWVtVyTF5kr8P4tCerdj14TuU5xH0k2obHZ16lLXiS5xeSCClo8cuRNAgYHH3/Nu5uIYOhRYTFYnk+BjyQq49Jd5IIC4AkSuvzrQnrvCfMQ406VMzc5BHqkHfNSmCkwHyTgNoOF+NqYHRhjG5Z5fJR2VMTE5gmFbBEKkVfYrf1PHLXH5XD7kMXGnrbhQHcYAArraOc1AMM8KulRiq962oYP/QCNp6+jARIHgbY7NUWdHkw1MSYiFO1h68Df+5BNvYuERkM5BbwMmr5WOyxjw8HmC/DnHiyKprYt/KCqvhZFWqozUmSqyNPGk/rSTJwxhDgHGhCRKXkIysvELkFZVC/GOA4D5EsJWi164+tc/jcUkX+GkZp0N/P1OrHvScFqWFS1eTZ/0o6dhUWoXSeYsQ5Y+B4zhwWGaIyqCblnh93VmoHsob0y9jDK8zMGbmEwQFTP/Hz8u8vT4fue88yCKMjkuw7TG8ThSEdvPKE+sh1RNgIJKHL7yNMbYc40x96nwfaaEOGioCsE+kpvNUCI2k6LowSiNGnork7lIuklnWtKcgS9zj9XysnEQq3QLGbTLZb7LKXdex4yTAuTXY30t6sxl6zOy5agLc6WNQn9XyU7+b6TmpTwepNAK0wG2ZlGVsfAK0oUYgJ4rNGAO9IiP9SEhKsX/jM5by8LAsY4wFVikqUTjVlcepzPfg0O5t0HO/D+zaYgH1GMH77KkjtPjroN22YJYyFByW5/H6WF4BpKhUjpLLcRdNT0A7PLPziwnycVb+ruNA/Tw8MGDp1xa24ZwMChoZaps8+3OkT5rICHTSc1TbtNXew/y8LEceYX5xObIp03gGWqWgVN69npxLKxhLKzwtMQ7SSrJiBExy47v7h+jOD0Mc+aX3fPK3gZZaFdIKiKVV5KW1qmuCtL47WppwhnxZfV01NXwbJ9QIdBwqTBcxGePAME0SIMY5gCY1Efhbx3j6nnprQGnQRtC1k5IROGhiCijGSCPp+62ocN/03z6dpEzAyQEYOADi6DmlWhB3+ev2vA1lL2UseqFsvh5zkAtNquiYGKj9IZpN4wxAWjAiYDcTzJuYWmlV2SfMMbg4E2xSPjGcgAKYjNxCTpgSgmEuNInGaMX2dHXQWmu0XHmQ1qqHll5cgoCjAHMXLMU87cRdtMwCukD9ckkbtMrmL0Y8vSMfLTjV0Rhj6Y4m8uxSFBf3izEGhgDgEFgFHErGUJb2P35e5u2yXproKRnZFriioqIhakOUw9BgHxQDaiWHLbloTMxkYYzBhXL4XcN+nMaMAHqEBsvHU78F7gla3oZ1U5keehfRMbGIIxednJ6JEnL1WQRpHXOcj4+BmNh4UkL5KKDizcjJh7bRy+MRMAbVZyx3gBRYB73dZgYj1Wf61G8dV72CVH5eW2aMLTM9Ox/5yi87z4Inpl9en4/nk5BfPNeWGUvKI3Ja9pOcv/0sR4qh6sRhyDvTRp9j+3dCAH6Gxxpqz0JlamOQ2hEVFYUYjpN4KobcglIkJqdMlzT1If5fikSGYlpWHpJ4XTTHo+RjHAeSmfJTW/Qcdts2grd+91Npal16iG1zCeC6T/x8WmYu5ixYbJWGFKTymSrt3v5fOPCxGsbF+JGekgjPtFbXRBqnhdlNV761uxezWS+uDKWZU9IyoGc0pNMqdyhYDYhJgvIAXazj+3fhxME9kKWmoI3O6b6PEi3Oj37cs98EcF66XV5fBFyPF8YwIMOZGWAgRm2V5XQrKt8zMIjG9i6Mc0IoP4eTOtLnIiHWj5SEOMiawBVft+aEACCLlvOytQ+ivGIF0jihxY069EaIt9BYmUkqUeClBJ7UhJCM4qjUtftVFrMemqWYgjFGl1uQba4/R351EhQkpQjoM5lucwEtSh/5cMziJSohhgCWTStNtJ7jOtb4GCdVM0QqT1THID9tVpSjygAMjHFglDDziWu+0jKyCaSLEBkdCw4AGN7P5qKTnH5d9WkbpA/SeDHMybAsnYdxYJPjAo7qBsjD0jy7OE1w3k0yWefL9cJHzjiOwcCM3ALMX7wKK9Y9iuKyBZAywRVeM2CnHc0VK9cjnYpTnoOHwAyY6T4TifDRfAsS4JXAl4c4EBOfgEzet3jlBixavoZAPYfediTPfvwt4Csum4c5C5civ3Q+RL/5OC/U/0FLNwGu6yIiwodI9qVN/O5h/4AvlWkoD+WTQFqspLwCi1c+AG24i2LbecmFtzGGGOVFLgF+2ZoHMXfxCmTm0SqPS4DGoy7U2JtJF/8OsoN0XNdp/KZnF0DLIZet3YgcWuHRMXG6/L5JzqU1TYyNRk5aMnxWsFMdqy7uJi/e0NoJcV2X3nO5347j0J1lXgUlttNlCUQwiAVOTYHbAIMg2tZ8Vrzpod3kp45Cv+V6adDLqvlYvmbql4QfoNstSypAoLyVKUjNPFXK9f2vtmrwGcNKKnGQKAfVdUqC+nVjSXlMsL2dvQNTIM7glHLyEDhFe6XExyJWgU33E12py25pclwXkVF+JJEzFBDrcZ+Lph9vMI+grgc05RNscwpLrYWdW1gGcbJ6zOjMEwEXLl8LKXYBbDwBSZb5TCUjo6IhUCyntS2A1xP9FvF6uc1a8ufx+DCblzHG1rOAdJ7WKS9UHVesJwCtxZwFSxBHK1bycxwX0QTfXNZ30Yp1UJlK5RXL2Ma0ywLVpeX7SdlkZOVCHkEFy9H9qrM8gaycAnh9PnuLyvLbskpsOUsIqEtWrcdifuqJerrv4qQnP9rHR7DeumbJqg1YIhBlPSV3Wbxpmdnw0yr30HiwhVzmP4fzMFJ9lpoBrV0vX7gMejphBeU6j8BXUr6I87Pcrt/O5lzNJiiqD0tIR+l8BdskBaAy84rKoA1uyk/5XlqcjkUSbFMzsqGxoPukOBYS+CV3PU9ceecVzSH4liCH5cmS1hgpmrvA7r1YuGy1lc+CJatQNGcBvbQc25cO++rS8oxRP0fRSk+F+nAulYdkKNmp7sVsW0FpOc+VcTwWI4f9rPJLph8kVkEZ6Pq5i5Yil5TeTNtcjvNLy7qXf39i5ifGxSCXIB7hdamnp6pu+K2zdxB1Te0YY8Bi6ui1/9fgkjWuCS9hJpKjk5bVnQKnfgYVtITwOC3yU0f24zy5Oa1imZwYh3FcwBhMvQy/0mIhaI8MDaKXLndXZxu6yHHeiiSuVGmYfKyUguo2Ve7s/hf4h6gA7H1EbWNYXxgaWQ6MMbiZV5BWkYLKHT39aOnsnVKiLMPLiZtBjyklMRZRtGacmyxntnU0xhDcIqB+1eMINOkEMhUr1pLqWIEyUh4l8xZDE6hk/mLIKpvPCVlB8FlM0Jq/eCVBY46deC4V0cXlxsUnEGhKoTyXrn7APq97MYFLVnhsXIK14i6+/mrfvT4fMkkhaOPNYgLl0tUbLzynRQpBKw9c14E/Ogb5BKclqx6w5ekZ4aqjFJW1Iq9WCM95aNHXjKM+AAAQAElEQVTG0buYS4pnMdu3dM0DWMy8BJQCC/HyxjhwZsqiYlEZqs+yNRsh6+9yaSmtwpnjSyULgrjAaQHlV0RrNzUjyxpJDkGa1bjmOzIyigCcDvXZ/CUrUUGZSNnMY34f9VkFYwkVF/psEQFc1+maQpYp3n1m/uIqr5jYeGvRSoFOyf4BLFi6BlLOc6hES+ZVoGjuIhQTTEs5VuZwzMyjESCw1/VSajqWRY8jmlax47pXKQ3WIhcAFxKw9QjdJZSVlLLqPYdKS+UVszyVVcayylnW1HjcwLG2BkUMUKfQ25PXor66amH34Enn0jrp72nmpCUhPjoSPgI5zNQV7aRSzjY0Q+uVp47M/v+k5DRoQJdXrERGdr61Tnx005TDOOkVLf/p7WxFa2MdOlqbMDI8DE1wM124MQYCLQUiaqtOYf/297Fj0xvY+s6rtyC9hi3vMm16DWcZkBsZGoIAWXWbTdK14g7lqk9SyYToNhrjwEOA8nKCu9cYgLjGa5z0SWNbtwVwBTeDLEO3RPi8yM9MQ1JcrH7elWSMYTu9BMJYWq7pFjTzaO0U0hov4qSXJZxDSkN0mmiACAa/rgY6Hq8PUdHRkHU7k/Rbx3EDL2MMfARzm9d0vlG0FGVJqn8AA9XHR5ffz+N+f4wtO9Lvhx1/swTImTyieJ9feais6Fj4qSC8Xp8tAx8rK8a2M8qWqfZePun8VPIjgnV0XBe34uXxeG3dFJjMILedV1gC22cEQSnMXFrI6fQudF5t0PW4gZcxlD+9bz3lMjU9y3LNspjFZWt8FBE8ZZXnFBTbsSMg1tJIny9yWmbXX6jjOpDMVPeMrDwqk2KoTVoSqs88jk8pd2GSn33lMrZhjLn+gu6hO5xL6xIZ4UVSfAwskMf4AeNAwNTdN4BzzR3o7GWwZWwc1/PyEMzUOeosuZlzqR1TOUgiKUTlIxEq8DXGQOD4xBiCtGqN0VGdZeJXw86ZoIUuGqavux0KmCnCfCuSVhN0tTdDSkL1CE3TISz5mu8AqY5+cvxjDMq5joExBh4qqAgGZqy1RzC/ZiZXuUBKs6q+GS1dvRA3SiOcV4c4qT0oyUmHgtA8cNfexhi4rss2eyFLRpaaQHIm6beXACQgcK4BisYYOI4Lx70o8bcxBjf6MsaB4zI/5uO4/FRiPYyZydPA8LfjTp/TJ681xlxXkY7y4H2Oy3z46eqTyZiL8zG4UJYzdZ0zy0/dZ4y5rjpd6WJjDFSuh/PSx75RH830lz71W8d1XtcZc+PlOpSLFKLX57vs+IjUPKGXoLHj9fo4ljysm4Mbfxne706PxwioLWrTTNJvleVh2x3XhTEG9/vrE9LysGFxtCiKstORkhgPw39EceiP8TZ39qChrQt9QyPX3W4PwSwpJQ2Fc+ZjPt3r/OJy8l25mFrlEEfrPAKgQI1xwA/Yl7H/8z/DYwzCENwF5MHABAKT4wyA3Yo0ZvMJUEEEJicgy3oKKFnsLN4C/a6OVgwPDsB1HDgEch+j8n66gRH8VLtnkc1lL1E9tMmqsrbRgrgxhtcZsAj4qWxLcjOQyj5C+BWWQFgCNy+B+zQH53L1ljU+vygPWSlJPC3gCIHULAZGJ3CipgFNHd08fmNvHzWyuPF5DF6t2PAoVj7wKIoY1EhKy4CX7rbH4yVgy/onhF3GIjbGIBRSnVQ+r2GgVMHSG0/Kh0lZ8eN63rLYRaVoN2BvdydlFCKIO4hhsCkhKRlqCzBTV1z3Sx7J4MgITtTWo5kyD6kT2P4InxdJsX4UZaUjmYHN6844fENYAmEJfGokcFkQj2KgbG5BNrJTEuDhFYZAJIwbGh3D4TO1aGjtIJDemAyMceChK+Mn0GmTTHZ+kQ1wlC9agfJFy5GWmWNdIK0+CalQ8MUv+i2XSOcV0S6au5BBmMU3nUTvlM6vgIIfaZm50KNMHQIlS73mu19rXxvOQcHYUdIpAt1AIAj9xRvxwB6v75p5XO2Cnv4h1DW3o56cuNaJW6GzbikJcaRSMpCcEItIn/dqWYTPhSUQlsCnXAKE6E+20EdOV1aeePHYqAi4pFh01cjoqLXExY0PE9CDsgx14gaTl3xcXHwisvOKCMaMijNyLPCLiIgiXaJnj0+huCxegbiCT5kMjBaVV0AR5gVLV+Fmk6id+YtXQSkzt4AKJBLGuaxYLrQyxOClLHDtytPqmiHtamMAEjBwXBdxiUl2A4j3JkG8lfTVieoGtPcO2GemAEGWYKyHJE8pLpoBOPfqdUX49SmWQLhpYQkAl0UA1yEQMaiZn5mKsvwsREaSr6a0JiYm0NbTj+rGNlQ3tN7QShVmc9m3MQaOI07ZgXEMYKYAHPYVohEahOiJ6Lg4+7yKNAZGb03KQVrWVJJCURnGsHxb7uX/mxgfh32I0NlK1NdVYWho0F4YxSBNcnoWktMy7e44x3Xt8Rv9r6axFbuOncHgyNSzHaaYoxDyMlKwdG4R/JG+G806fF9YAmEJfEok4FyuHcIwj+ugMCuNYFFIsJgC8RBpjbHJAKoaWrD7uMBl9HK339wxFf6xHAioPGaMA0OQd10PvD4ffLTib3VyGXw1huV9rPypH2r7xPgYOttb7IN0qk4egbZV62l9ILo6VHxabaNlTFpOdbW8pnK88v+TgQA6aX1XUVGerGvEKD0gXe0hDZUcF00uPBWleZlhKkVCCaewBH7JJeBcrf2y+JaXFyORVrlAHZgCuNqmdmshdvb2Y8LSCLi9LxrlwWAQWgmih2bdsUTwHGVgcXhoAOK/tV27vuYMqk4cQV3VSSiYKYl4aHFH+aORkJyGgqI50BrUmxGIlhVWU1FWnW9BY3vPBY8ngsqrMDsdxTkZpFQS4KXSuZlyZnuvnpejNeqtXb2Wo69tarOfegyAdvKOjk/YrNRHA8OjaOmcuq6GHpuubWjrgq4bm5igRxWiZzEK5aVlk8pX26CVgTY1tdPT08PWlDqpyBREb2zvtoFdBXdVpn5r89Pw6Dim6jYM3adyeweHMUaPUfkpifbTOa2samI+je1daOJnc0cPlMfo2Dj0YDfFHNrYPn2qPe09fejuG7SPYA5eQhuOT0xC9db1qqfu7+RcaCH91cj81V4lldHVN2DzV12UVF9d39bdRzn1UFn3cw4FaAbABsZVH8mqmYHsqbw6MZNXT/+gpdUkr8GRKRk2sx1NbE8jy1XSb9VlgsYWp42KtEl1Vtus3FnPmc8OylttUb3sheH/7jsJXBXE05MSMK8oBwWZyYiPmVozDoJpBwf4qXPNOFXXZCfC7Wx1kOWJvhjo60ZnaxOa6+vuWGqqZxCXdEnlsUM4sHMzdn7wpn3ei57KN2MdyzMwxkVWbiEWLFlpH7oki/lmZKJJ9d7eYzh1romTW2piajrG+KOwfvFclOZmwBgdv5lSZn/vEIF538mz+PvXN+M//eU/4t/+yQ/wH/7iH/BHP34T7+w6jPqWDg6LoAW8g5W1+NvXP+R1P8Hv//H38b/9+Y/whz94De/sPmLBU5uXjp09j++/tRV/x/z2n6qBlJaA6Vh1PX76/i5sPnDCpte3HcCf/PRd/PFP3sL/+vkmm/6ff3iLv9/Gzz/cA62fF/DvOX4W/7BpF77z+hZsO3TKAv5M6yo5RpXnX7/8Pv70p+/gj3X/P7yNv/zFe/jZB3sgg6Rmmrb6wdvbsOvoaZxne37C/N7adQhn65stcM7kp892AvDeE2fx/be3Yuvhk6hpasXLW/bjr1/5wOb/33/4Gv7Hj97AX/xiE97cfhDKX+3TvarvWSroH767HX/z6gd4hfcJ6DXOx6kMFch+d/dR/PnP38P/pHwlu/9O+f0F67uJY+J8S7uV17Gz5/C9N7fYMv7kp29DclH6C5Z5cZ4qU0kKZuexM/jeW9vwnVc/tLL/zqubKce92Me2DM1Qdro4nO4rCVwVxL0McKYmxmHNwjJSK+kgcgCEFWn1dmrwLYdOcCK18Njte2twCzC7O9txvrYKZ44fvKOp6uRh6PGVzQT0zrYW6PnHY6MjcMnb67kfsQzMlpQvhLYl61kWoniMuXGAlWVXTRpF4FZvVwEFIblrFUpGYiyWkwvPTU/BnXrJYttHoP3F1oPYdaIGXbROPa4DWXWHz5zDz7fsw46jZ2yc5EOC75s7D2HLoUrIIvd4XIJ7CALn1wjIPyVoyqqspHL6YP8JvLP/JF4hyL296wh6+4cs2AnA95+qhtqu5ZXdtGRPENzfJ4C9v/coA+v1tOoHrDU/MDRirdTXtx/Aq9v2W0XxM4L7USoJa4mS/hPAvr/vGOt0EmcJnlKQDe0d2H+6Du+znrr2zPlmGiSN+PDASYi+kpW87chp7Ge769s6MT458TFxy1JWGzYfrGR9GuktdeGD/cetApFhI4u5ldbu0bP1eGXHYbzHdlaSFpMFXs2+FUhv2nscb+85jnf3HYcUQgst6nFaz820wA+eqcM2yvR8a6eVi0B+L5Xoy5T1T9/bTcXThqNV5/EeZbLneBXO0TMeHB5B/+AIBqlw9TxvzZuLK91Ow+sM5a78ZXUnxsYgMT7aGmd+xrwcjueLrw9/v38kcFUQFxTFWuuvHFpyGOF14QigeEKDZfvh0zheU8/BM2zd2lvdbBUlLlpb8/t6u+0DsmrPnMCdSnVnT+E86RP9+bF+li86R5PDkJ+PjuYkSEqBniin52bkFpYiOiYOjuvesBhCvFP0wYHTtagksGjyIhQAjIPkuBiU5qRhXmE20pLicKdeDQSx7QS0d/adQNfAEMoLsrCuYi7mF+UyVuLD2cZ2pjYb6BaAb6Yl3EhAmlOQjQ30GpaXFzEg7eAQgenlrfsJ1G3W0j1NC7e6sQObD57Czz/YjUoCzFkC3KnaRpuXDIWM5EQaD6m2qTW0lkXNGGOgjWjZqUnQuDhZ20DwPYGTHIcCKCmHQ6fPUdkMYDIQRFt3L45TCYiaEtBF+jw8PokG1vFoTSPr3moVQRMpCQF4I0G0b2gYp+lpykoXYAeYj63E9H+iMkTpnOI1Dbyvq3cQx6rOUfF0wmX9CrPSkZ+ZAi/ny55TtdhyuBJHeF5KRyC/ieBb29SBcy2dOF4zVX+1L8BYSA9lXMfj51q7oIfRFdPrKmBsSvKQUnl56wFI6ZylQjrFttcT6EXB+CN8iIzw2j4RKLtUtMYYzLwE8LLGRRVFR0UiOy0ROWnJyExJQCLjLB7Hmbk0/HmfSeCaPRfFwbGwJA/zOHkzaZV7fT7bxPHxcdSTr9WE2Ucr4Va6YyFSKEEOaNdxCQAeeAiMDoEsRC9AIHqnk7wPxzFwOTE85KEjo6KRkVOIeUtWQ4/B1HMmIqNIN+HGXwJwtUuTXZZlL63MmdwMDOYW5uDRVRV2bbjrXLPbZm696U/xvmfONWJ0ZBhr5hfjt774FF56dC1+43OP4z99+wv4/a8+j/UEdQFQJUFFz4NeWpqLLzy8Cl98bB0++9AqvPTwapQV5KB/dMJa6HvDNwAAEABJREFUrcOMNSSRnivPSYYHQRyorMXfv7EZh6m8InxeeNnfAq5HVy3CN599CI+sXIh8ApmOPbZyEb713EN4Ys1iS9+8t+coRkbHrIfy4gPLoLjBGSoIWahD5I19Ho8FNnkFQ+TQO8hdD/PTPmQtOAkLfizTdQ0cji9J1lDeBgH4PA7PR8C5CAzBl0P5exwD2EfMhuDyu8NUkJXCui7Arzy+Dr/1hafw6y8+ipTYKPT3D5BK6iJv30el0YbzjBFIlg9UlCAjMQY7qSQrqRCMMfB5PfA4QII/Ap95cCW+/syD+NpTD+ArT67HvOJ8DE8GmU8/FVEAcZShMQaDlKfa1ckYgtoGvhzH+Vi9PR6X9XTJwQ9YhbnnxFnsOVGNE1SaihfIc+Ft4fd9KAHnWnV2HQcx1NwLinPxwNJ5iPFH2luCoSBkARyrPo93OZFkBUnL25M3+Z/Liadnj2j7ui8yCkrahOP1RcJzB5PKi/THICY+CVo6qKcx6qloetpa2cIlyCkohh4mr2cxaNLcTLNHCESHaa3KCj/LgODY2BjACer1eJESH4MFtHxXzi+h/KN4mACCO/MSqMb4o+C6HnSR8qhl3ToJhHV04Q+Tktg3TX3IRY/h2NBnJ8FENEwHXfhO0iENDLr1EMgMx0wkjYIQA4UBAmBZTjoeWFKOlQtKyP834zSt+uGJIEJst66TJZqRnIC4aLUZtt2xrEtKQqwNkFYzwLqfCmCIfG7PwKAFylEaF6dp1X944Dit8D5a65PQy+s6SKLFWZCZhpLcTCRTprLk5WnI45G1TfYFUqbg//reQ6tYdMxxWvlSrhrrNWx/H48bwz5g0vU28YZh1kNgKuqitnnKOxkjReL1eq2nKtqkknXrGxq1gd1OUpIqo7l7AGfohZwmkEt+juOSwglabl/1k3dwrrmdgdZ+Vi1ogd7A2ICo1+MiPjoail9JVklsV3RUhAVwebGYfslA4C223YVZqdaTms94V1F2GlIT4mgsuQi/7hUJXF89nNlcboyhG51NK2MhMjmpIrw+3maYgnSPW7GFLvFxuqyavDx40+8oDsqklHQLnKkZOdBOyruR0rPy7FMXtas0v3iu3ZCkzUWLlq1FYem8C49TNUayuPFmywrq4IT+kPyoPJtugqX+Gopy1Br9OXkZqKB1a9fs02rU8TuV0hLjMYfUSFpyEs7TxX+N/LMoizd2HLSBQXHV5xkIlIsuRZMYF4tGUhXbjlRO88SV2HuyGoOkKLKT4+yqGj85WJeIkp+ZClnWL25cSRDxYHh8EgF6XF6fB/K+ZtpojIHrOnBoUBhavOMTATTSmpUiae3uJx0QI9hFZ5++R5OPH7H0RXNnN8YmJhEV4bMpIdpPKioemSmJBPRYa/ErBjFMBeo6DiJ4ndfjsWWpjuLPxcdvJx3yIfn+raSKjlTVsZwBAqkXUZGR8Hm8cB2H3yNY7qjl1nccrcTbDPh+SI7dcTwsLwlx/ijLsesPq8THRlvvQf3u83jgZbnNnb3kuc8RvAOkRXwE/RD2nqi2MtzMsnfTcu4fHEImqbT0pHgIqCkWe62UZxzbFk/LPNJ6ygZBKhUpF0y/DOXtdR0L4lp1VpKbjlKm7NRExFFJOmzD9KXhj/tMAs5s65vGgVNRko9V80qQm5EC47qgOWTduhZOpJ+R1zxMd3i2+V3tOj3bd/7ilVi98UlsfOIFPPz0Z+5KevDJF7Dh0Wewcv2jdmdoQUk5klLT6RlE4lYO+m5aqbL23tx5BJWkJEK0UqfkE6KVFYXnH1iOxWWFcIyZOnwH/y/KTrdA++TKeYjyOthMYPqbV95nUO0oBkZGsGpeEVbTkl46txBfJI3w+OpFSCPtpqDb37z6IX787nZIua+YV0xqYCONgRwU0vorzMkgePiRnZYEnfvSY6vxyLJ5KKaVmJeWwnNRF1opq7mU1rOSYgNjExMMpLYS6IIQ5/6bX3gSv/eV5/Evv/g0/uVLT+LRFQuRQGXSRLrP5/FYq1NWaic9hF1HT2MfAXFsbBzzSFFN8ft5yCLHLlDLSI63wb5yxh7iCIzivLccOsmg6WG8x7iArOn+wWFkpcSzrinIIKiKU5anmsJ2d5Af30IZSXFJQawqz8f6RaUoZv1HxidQkJGCLz2yCv/ii0/i33ztefzWS0/h4SVzrGzrGcgm+iKN1nRavJ+xgRYo7rSLQc5xKqPVC0pJrWzAItKbUuiSR0xUJJoZRN1zsgoKfu6nZ3SCnoO8k4stcVEvybS4OxiY3nWsCj97fzd+9sFevLXzMPafrMYwqacLAg9/ua8kMGsQl4WSlhyPx8lTLiK1EuH1WCAL0jVWwOgwI/FapXCgsoZc5dhNCcFLSz86JhZxCUmIT0yG/gDr3UoqPzY+wQYtI6P8DFb5bLtvqoHTN8taGiWYHCItoeV0dbRo9XwampWA4yI7NZkAV0SgKiZoJE7fdWc//HTNCwisz65dgi8RpL/61AZ84dE1+DI/v/Hsg3jpsbWoKM2HnkMvmuKJ1RX45nMP4stPrMdLj67BS+TFf+35h/H5h9dgzcI5tJqj2aYSfOXJDVhFUMpJT7agv3HJPHyJ13/z6QfwGMeYrPSZls4vysVLj6zFFx5ZAy15jfR5LSXyNOv0jWc3Wg9Rea2ggfHQsvm2fl9h+QoC6/jned83yKP/yhPr8NwDK/AiueavsP6/yrLWLppjN7StZxD2V5/eCPH7+RmpLGutbcfXeI3aofp/5sEVllJcxmDtyvml+FWee5CKpzQnk2Wu5fUP4evPbLTff4Xt/irL+CLbtHZRGebSm3lx4wp8gfGBZ9YtweqFZVjO+m5gub/Ca8R/i66cz7klGf6TFx/BlymjlyjfL1Luig2oHapfCsF4eXkxvk75q11fJl/+OearJIW/YXG5VUTGmBkRciwlYi3b+gxlJiW3mn2xhnVYOqeQCiYDEZTphYuv/0v4jrsogVmDuOoYGxUFDfblHMQ5dMO8Xp8Ok3ccRxOtgV0nqi7w41r7a0+G/7uiBMZpmZ2n9bWDga139xxDLykHBW+NMYigbMvJWT5Cq1LgKEvqihndxhOu40AAvYZA9CWC4L9gYPN3vvQsZPV++4VH8OSaJbSs0+HSM5M7LyD9KgNxv0XrWNf99q88jX/22cd53WK7qiTC68VCenSfJegsIxClka4R/11Oq/jJNRX4lcdWW55cKydmmlWWl4VnNyyzSd9FjyyiNfr0+qX4PPOZx3uz05Iha1rnH2Pw84sEv8VzCrGScYSn1y3FVwiIX3t6I1Q3fQqAP8/gqyxoAazq/QUGbFcSnLNplT/DvHWd2vhPXnwMv/6ZR/FNguaz65cxz1JUlBVYsF67aC4KGHR9hmUobymsf8KApq7/BhXMUwRNKaGCzFQbqHyO7VjJOmmZqLwDeTpPMEj7AgH+cSrABcV5eHjFAkhBfptArnyUvvX8QxC4l+ZlWmpI132RikLt+CaDv9967mEb8FU7lZ/iCRd7bunJCVSexXiBXt1nH1oJlffCxuUMli+C5OQnxTUj7/Dn/SUB53qqKwpBLuZaavTPPrSKvGIMQMABXyFSAKfrGvH6jkPYRg5RARkeDr+vIAG5up0M+v3onR3QuuqeoRHoeea63OvzIj0pBmtIUzzJiR0fE6XDdz2p/330wPyRPmu56fd093+sbgIPH9sgsBVH6zgfWYQfu/AmfhhjYK5xv6NrmK5x2T1z2phrtejmq2qMgfrtY4nHEH7dtxK4LhBXX7uuQ4sqzVpLq+YXQxYQHNfy4+LhFEV/ddsBC+RN7V2MoE+tDrhvJXSbKn7mfLPlI7Wp41xLO/RwMQG76zgQ7/sUrbM1pBvSkuI/FuS7TdW5arZTtM+EXS1xoqYBB0n/KJBdx3oPkkvVyo6ZDDQGtFJJAcGDp2twmIHAmsZW9DIoN3NNHznlBgYmFZzsp/cxc1zftU5eQV4FGxX409pmrQUXF61lcSpX98nTm5icxMDwqA1ydvb2M4g5wTBNiGMuwOMj0KqYTvLgykurZbQBp5uc8GQgCJU5MRmwK1jOkcZSHeua26Hxq4BpNeuscsRrq31qZyPHszYHiXc+xPhPbVOb3fSkvJRU/4a2TvtIAuVX3dBKXrvVrh/vosKeDAQg+bR199mVNJKD7lOaYFvEtddTLpJfH+UVuGR9uq5T0jjp5XkFlDWOtOLFpromu5V/eHQc/TQK2rp7LV+uvGfuG2M8oZOyamrvtqvLRhjU7aKMatiW0+eaoE1JSg2sh/LQahl91rd2oqq+2S5P1HVK6httYNL46GOf2vpMX1N5rtHm1cwg98w1kkElyxDleqTqHGoa2xjgHWcY4KMQ7KRkxDqp7lpXr3orBUnbinpUvasbWmzeqqfqpLqN0qudYH+qr9WeIY5L3aek/tZxjQG1RceUApTvCGUleah/dex+TNcF4jMNTCEnJx70sVULIXfUzyi9IyDnBRK8NnC8t+8YDpyqgQQ6wQHKU+E3JTDJQSqQ2nXsDLQD79S5ZmiZGUJBwDiWy5ybl4HnNixnAKvAArgxt99CwxVeqq/69Cwnzp7jZ7Fpz1EG+Y5AG1a2HT4FgZpWXAgc+gnINU2t9rk6m/YexTu7juDd3UfpaZzC8eoGaM35OAN0DQQ6tX/HsTMEhhYCzrANUjYQOPafPAsBhCarQGIfx5BWP32w7zg+3H+ceZ1kAK8ajR3d6CIga2IqiHiaSlH1FOgINAQee09U2/y1lO8oQUNLOKsJrFIAau7o9HJEKYithyqhLftbD52yW+m38veRs+cIwB0sZ8CC8U4GGNV+7TB9l3LYSo9TCkb9qXYJTHSNVrOIItt59DQDk6ewi/dpd2snwbKpowsnGHhUELKRchAgqy5akaQNXjuPVWE3632qttHGlmbO6xol/RYoNbR2QcpEYHis+jzlWw99NhKcJYdGq3DqeU0NlPcEAU6ptbOX100d17jrYJ30QLuDlbV2Q5byULuPsu0CSG3qa2S/HKTSOkTlLTkePXveXnu8ut4qLCkClXeA8bAjZ87hGM/r3DHGyRrYRtWng4rrDPtoH/t3P/tU6fCZOnt//+BHfylMSvkcjYN9J2vsOcl1qs0BO0+O8B7tKzjGNitpE5lkIAWiflB7zlCR6LvkpTQwPELl3GFlIUU9k+cYFZpVLFR+bV19uvS+TDcE4mqp+M/nyA8+unw+SrPTEEkgB8EmFAogQA2nCPhfv/YBNAkvFqju/WVOPf1D0EqeV7YewKGq8xgm8FkAh4DaYNncYnzJBuVy7GaOuy0rWViauH/4gzfwf3/vVfztax/i9a378cO3t+MPfvAmfv9PfoSXN++jZdkNWcrfeW0z/n/f+Tm+++ZWvLJ1H17Zsg//48dv4Q9/+Dr0bBKB7i6Cmp4L8n/8/Wv4uze2YQ+Vgywn3f/nP9+E17bvx6Y9R/Aqy/kfP34bP/1gD5XFOZysbcCbOw/jL15+3z3bcswAABAASURBVOa7/1Q1j5/Hn7/8AWm8w3bn5TiVhCamAOXPmNdbVCTaJfndNzZDz3R5Z/dhqzQkV4GLlIOeJ/InP30H/43t+7+++zL+4Puv2WeXvLb9IPaeOGsVh9r1X/72F/jBO9vwGuv1iw/34r//8E38T7btH9/bZdd9b6UC+O8/eI3H3sRfvvwevvvGFvwN5fUHP3wN/+37r9qdpR/uP4Gfvr8bf/qTt7H7eJWqYdMhguRfsV3/4x/exX/9/uts43tWUQmw7QXT/8kilaz2nqiCyhXQ6lku3bT01W5ZlNpxuu/EWXyfffSnP38fBwnQ3f2Dtt3v0bj6q1c/xF8yCdC003UTFdKHB05Y+bb39Nm+fHf3EXzn1Q9w+nwTdh47DT3OQCuomqgk2rp6cZoWtR518Hevf4jzLZ2UUzV+9v4eVBGo27t70U0FK7pwkJ6SlNcrktnmvfY6hELoZX32so4/eGc7Pbva6dbB3v/T9/bgv37vNbxK+Wu8SPkM0zqX5/OT93ZiB5VnR08/OulRHKcieWvXYfx40w5sPXTSWuhv8D6NlZlMz7Cuuu+/fvcVaCNdGxWK8pTykPJ/ecteKsHzM5ffd583DOJax5tMi3wNo9wvMkBSyMCN1grDuOyjILX/oN0N9tMPdtvBK02pCXbfSegWVViTTwP/9R0H8TaDmCcISAMEcG16AQE8xh+FVQx4PUyluGZhGRSY8rgXdQ/uzquBbrTA5ggtH9VRK0K0WkKBRtVXAbMQq9ZMy/h9AsQxWnCq99PrlkBBthcfXIGy3Ax0clJvO3bWLg1s6eqBPLSO3j7soWWm7fiyyupJa3TTMuylohPodHCSNtKilKUvK3+CAC05sjiOMTCgPolB0gZaYtczMGiXu6ouF1vjXf0D1qLt6O5HO1MvaYgZYPRHRdpgn+IODywpt/fLZZfsH125AOsY+0mIjcZmAtxR0kJREV48wwCmVra8wEBkfkayDehrW/1ZWvhNBLgO1p/cIhS0LC/MhgKaZAJQ19JlrcFWAqCWlLbQ8pPVqboIkDQeZFFGeh2MjIzgpGiryhrIcld7Z5IC35LBAK1LgeTo+KSt9yQ9PLV7yhSApW0GeU1PXz+OsO6ybvsoK1EQTbSsx8fGSadMYIDH+kiFBINBu6kvNSEeyfGxkDdT19yB3oFh9PJ8P5PrOHb3a4w/0l4rZSIrXQCr/pGs5d1MsC6qT4jepcsxrPGg+krRqO1SNKqrx+PCy+Q6xnpiqoe8mab2TmjhhMqceeS1rpcH1T0wZNsbw/kSyxTh9Vr6rKWTY4qKTF5BNxXEMGmSAI3JXva3vAGd1/r4QSqVvVSAqvsk43jqb9VLv2dkfL993hRKGLZ2flEOnn9gBVYvKIYi7j6vD4YnAhwUnRzQsoRep2YUEGiyaXDwtl+ad5AzWG3WZNxGC0JW5V66k5rMoIwAA4FJHpXg02sX48Gl86BHzUYwMIh74KU+O0b3v7NvCOVFufjW8w/jN7/wBH7t+YfwGSpvrepIiI2xT7PcS8uqnVZYMT0zrZb47S89A63ueIhtiozwoaqxHeepFIZGxuBncFQbVwaoyOS1fUCgrCMn7ZBScggWruvC5/Egmtf5ea8CqgqUxhJAlICQnfgaZxbRhd6YftHSCzLpl+F/Go/KU3mDP0I8p36JjYrE4wwca5ne157cgKyUBKQlxqGiLB/ffGYjXiRQ52Wk2scBqF1z8rNs+227XnwE6yvmQPmeoDte39pB4BxFJIE+OSGWfZiOBSV5KMpJt6DoYXtmquiwDq5jWBVjefwquv+VzKOVFmJheiISGcgWsO84UmlpHNWVzbjoHbL3uq6DSJ+HycfktUnjxktgBF9JsX6kJcSglhRXZV0jBORdVKaRXhda326mZeiyLv7ICLs2X0orPsaPhJho+9vDerusr8d17KoYf1SE/eQhqE/jeK3q4TAP1zU24K1gtlIU+80f6YPuiSPgKl+taw9wTgjA46KjEMf+jPB6IIAWgKuOA+SztQJOj96Qdd1FcJYMPK5LetFBBGUczfqqDLXVy7rFR/ttvcCX6gYDjJEuUYzjHI2DYSqtlfOKOeWC1mLvItArT5d1dhwHxvAG3ns/vp2brbQmVy4tkl/j5H6SHHk6B43XG8FsDdQJ6pzt5Ab//OfvWlemlsEMnvyleav9Gkh/88oH+DHd7kMXUygcOMb1YE5+NrQOW9atNnHcS8KR5SfQE2jaek2PdVk5srr6aOkMjY5C1tfMNR/7o0y8SXnw48Jb13o8Lh5YPAdPrFxIwEsjdXKQtEUlemjxTZK/FVDnZaRAexIWFueiJCcD2unYw8l3iAHTt3cdsq7zJBUhIQ2ySAdoeQZpfQ3R9dZ1AgvAwBgmjvQQgggw73Fa9Kr7GCc5+Ir0eRFNMPGwLwQUGtNRBB+BlL4T80HcgQFgjIHBJ1+SkUMgC7E+DW3djAtU4Reb9+EfSTHUMkiamxJn26s2jdF6DjELZkWKYwTyYMSHB0OGgdIReg7jPD5s5XGS3Pgog3YCHN5i3/Zex0GEzwfFpzKpfDJTk5CVkogEC6ouRtk2LblcNqcQjnGwkxTWK1v2Q0qqLC8TGQyYO6yvMpTCkwdRzbl5nB7XmfMtUD21Pn5eYQ7kYcva7qYCaCWnfoaUidomWcszyU5LgmTo8Xim65OIrNREZLI+sQRXKZZcYoTW7Gv5ZCGVvJ8grKDx9qOV9umSfez3zQeO4xB5946eAXTSC6um3A6fOY+ahjYqyDG214sg5SsLvZEemhSTYii67vHVi1FRWmAVe4jKSe0aoNX9Iekrceit9HxEA1XVt0B51jKQq3ES4fXB47hWRrrnfkzOzVbaGAM/NW4JXeZHVy3CZx9aicLMFPgjIwAOHgldnXWGA+P17YfwC3Jj4g7l8ggI8Cl9TTCYKyt288GT+OE7O/DBgZOW7xsg6AXoxoFQ4I+K4sDLw+NUfk/RCs9LT7lgTeAeeWWlJDHAmoeU+BgLmn9Hzvt//exd+zzqV7cdtK66wFO0ysr5ZQSJBNTQDRcnLt5XHPoWBglHCKyl2akWHDThxwkycbTEVpJC0trrpLgYQqyDCQKZcRxI+XXRAtPk6yR4aELK9ZVFNUhLfnhk3AJHRnI8kmlx1tHa1DPF//IXm/D9t7YxoHgakV4P0pPiIOtS4NxNmuZw1Tny8Jvxp+TA/4zt+OtX3rc7FlWfECe/AJIsABxj4HUdyHpcTgsuiRTDaQKAnqn+Jz95G2rXTgZmNb7nFWTZdkV4vXT1gxCFok05T61ZAikgtXOEwC3qRICpMlzHgWijMwxs7688hxG6/wWZyYiNjkQOQVHeWP/wmF0NcpQU1YiepXPRmBCASh7dlI1oonZa8e3kiWVpD5Ai0fiLjopAFvMqzE6H5FfJsubTm9JGKrU1GAyxvgGwqchLT7aLFFbMK6FXXYq19DKWlxfb9juOoax9mE9lKlksnVtod7tGeL3WA5skfSKFOTY2gS72meoi3rmN9FUnvfEupiZSTbK0pQQmJwIIUNnq0bvjlEsP+0XnKumNeD0uFpXmUxnEIod1ykhJwIHKapwhNz/JcmR9q/4r2CdrK+ZaAygmKhJ9pFmGaEw4bIzHcSjPMbua6jQVjtd1sagk33pE2VR2WvGlRRc1pMACVArdpOKOVZ/Du4zDTKWjHD+VdqWPZHyR2O/JrzcN4mqVQ6FJkCs5AL7w2Bq7vjmPVlQkta3jGHBucBCNMEBSBRvgYLDrGCPYrd29ENWgga18Pg1JFpnogkYOWgWXXmFw78ebdtn4QA8HGoQQMLT8/NAmkcdpiT65psLuXozmpLvXZKB+XMO4x1JSDEPkat9mEEkBNX0eYR9q4kRH+qBdjo+tXIRFZbKGQniHgbEfvbuDFvZ+8uBtSCXFsGFRKS3qdGuhCbTjo6MJHHl4cvVibFwyF/NJP2SmpSI1MZ5Wl89a92NUhhojw1QCAp04Ar+Unbaca6NMYVYarfUcen1Ba20qAPfBvhPQdvk5eRmYQ6szPSmeZSbBz/EohbCJMYmfb94LBbRe23bABvQCBLTUpDikJyVY4HIdBxrXqqeME4HAGC3iN9n+HzEYpx2250kNZaUk4MGl5VB9BA7pyQlYs7AUn3t4Fb7x3IP43EOrsKi0AJEREZDykVWsMnLTkm1Xa0nlEMEvl5bqhkVlmFeQbUH0wWXzIYptiOBe3dACWeO6wXDsuI6DaLYlJioS/fQ+OgjebbI0CZpSVAKemKgIglYMppRwPjJoFUeShlhIgCzKzkA07/URhCNpgKmNFaV5Ngagch9iXEYALrD0eVzLf+v7SgLnOoL7A0vmkUJdhixa2y3kokdZ/yjmHcu+GaT1O1OfVioW8faysgdYT4F7A/l4fQ9wHkSxDYVZ6ZSND6I3AgR2yVE7SudaOZRBe1JaiRMqxxiDbMpN8ly/uBza2fvg8gWQt9DOgGz/4AjnVaQdP+q7HoIz6EbJu31kxQLMZYxC3oCS8uug3FzXgVJ9WydEd06lU9h3spoxlD6M0WuT3O/l5NzKyvk5mUtzMvHrn30Uz61filxaAb6ISMCwGE6SEC1Q8Z5v7T6KP/zRG9BfZ6lrboMmBz4FLwF4gJr9RG09BGD/40dvEsyOQQN5YmKcyiwIKwtOwgXFOfjio6vwxcfWYkFRHu7VlyzRxWUF+N0vP4Pf/9rz+NYLj+DpDcvwpSfX4/e+8iz+229+BeKOswgSqxmQ/bXnHsJ//NZn7TM+tEzyefLmv/MrT+HffPU5/Cp55szkRGzgBPyNzz1ht7DL5U8mwH/92Qfxr7/0FH7zMw9BXsmTaxbjpUfW4HfJq2tn5UICfAlB+RkGFn+X5f72l5/FRgKdgPxfvPQkfu9rz+HXWDdZ9V9+ch1+50tP499940U8vGIhATwRL9G4+C3tIv2Vp8nTP4xvPfsQvvHMg9CW9SWkHLJpoX3tqY34Jrn+J1h2HGkJ8BXrj8JDyxbgNz73GP79Nz+LrzyxHs9uWI4XGLCVTP4V66ct9qIOBID/4qWnyLMvRh6NmDjeq8fofot5fvPZjchMTrCWueryTz77GNs/n0otA99+fiPb+Sz+Jesm+X6T1OQ/5fnf+/LTNu5QkptJpeZlbQCHRpGf4LdyQSn0+INygl0W51kGlYmUlfpLXsOGxfOoTOZAclsxv9j2x2+zboVUeupPybcoOw36/giVr6iI1MQ4W8bMf8YYludgyZwiu9s0JSHO/lZQcQOBXPGElfNL4afCqCgrZH3Wopz0S3Z6ElSfDCpP0TsK8r706Fp8hgptMa9zmG90ZCQWsU+//eKjlO98GgEpdkx9lspv/eK5kKJQX2sMPLdhBRYU50FjTAHlRbSqMf1awrGpRxPIS5CimcO4xVNrl9jrM5IT8ZUnH8DnH1ltd5rbPNcvs3NO40SykQeixzk8vHwhiiibqZSOXCrVGH8kPAT56aLu2Q+i661CSUNlAAANuklEQVSrm+PQQmCHSps+wYDRlx5fi2VzC6kZOTgc1xY0SouqrasHR8kNv8aA59+9vgVv7jhkn/42Y23ZC++z/3rI1R6vacBP3tsNWd7v0NqTK9fV14+JyQk5I9T4rrWOHqH18AKBUJZrPid7NGV2rzbXQ1dUFpb6VA9geozUjwBAz9DRio5FnIjpiQnwkbqQlVzMQN6aRWV4lMAgMBRXqWCtnnCYnjR1negGAb6ujaf1JmsvhxbWElr763jvXNIT2QQmAbw2lG1kYPQhykxgqmejrLdudBaS42IhQJNluYpgMlW3JbTQKggC5SgvyEEyaSBZnQs58dcRHHS/wFZ5Kq1jXgVZqVA9BObL5xajLC8LonzUJ67rQHRMKS36tayb+sy2a1UFvYd5ED0h8FP7CwkCaxfNsVZ5PAODLq3YFNIwartkkkt6QN6XAGkFqQq1s4Blr6XykyUsGWQkJ0BJgCR5L5tbhELmG+GdAnFjDDzMN4/jZvWCMru6Zjmv0XXLynVtKpLYZt2fS3pO3kEiqapS0p2LywoQS2BS/nMYh9HxTAJdSU4GJOuYqEg1+WPJGMNziZhHGkbjwHUcC2xawVNEmmZeUQ6Dk1GkY1KwitTYCnrjyynDmfromiTKIINKXmWupEJZxrYvZ12XzimkrDKgvpYSFBBrbMRTgSolsR2q10KOMbUnmcq+nEpC3g6mX4lx0ShmPaTolE8qFU0JDUnJWu2cT2Mpn8Fp5aek8ZBND2Ihx4PyTKPXJ4poDftghepvUzFE6SSz3urX6aLu2Y9bCuJqpcNO1qRZMa8YslCeWr1oSiAUlgIfIJxNkg/tIne261gVfvD2doLeTnzAAMQpRtBbCfCDjE7LohV3qDzv1TTBIJlcQ3HfR8/Wk1M7Sr51C37BAJI2Iagdss4dusCRdKczOGE0WT//8Eo8Q09Fk8pPq+pebd9MvWQ5RdLtzqK1upAWkSaqLDdZLZr4ArqZa9X39jpOPI2BZQQY8bsCwplrBB6aQJokytcYY5eaaQIWEtQ0sSQXTSDlJaBcSZCWG6zJpYkeQ8Wncqfq5rVAo7ppQkqumtjRuobjUTxrRnKCBcNSgvEcWmtzacHOIZCV0spN4cRXPWTpCQhSCBZSXrjoFRMVCYGsyle7lrJdAigBw8xlM+3S/VGUl+EJzQf9lqwEPgJ8WcwqR8A1U68kAi0vv/D2eTy2PMlJ13gJ3DMn1WZdX0yFKdkspKyVpFAF7lKmkrfqpnp7qYjjov3WmFK7ZGGqHqqjgFn9oGsjGODFJS92DZSf6qzrXcexVxhjoPZKJn6O4WQCrpTNfIK66qKk+uRT2UhxuI5jeW6B8DICuBRmGftCdYmOioTao37Xd1vA9H9qt/pF9Y2lZ6N6xFIRTZ/muPFAbdA1yQRd3S/w13flqb6N5jiYuV6fXo/HjhflGUeFUZCZBtVrEYF9Js3l2JAMda3uuZeTc7sqp8EiwX71yQ341nMb8fSaRZD2dhwP4LjEclIL5MUEdLtOVOOvX/0A/+U7P7eArp1e4pWDpCZuV/1uRb6djKDvP1WDv3r5PfzhD1/DX778vt0N10urPBSYnGojB68opWxq/xceWGbd5sdpxeXRSroVdQjncZ9LIFz9sARuUgK3DcSNMdbFljsn1/EzG1fgq+RR1zEwIu3olXtoHLskqI8BCG0GkvX6xs4j0A6677z2oX2wvrYodxMUFdm/ybbe1O2yqGV5t3b12mVQ2jL/929sgZKeQHiUQb7m9i4MDg1jklF0sG1KAu8NS+aQk3wAeoJdRVmBtYguZ/XcVAXDN4clEJbAL6UEnDvRarlc4iEV2JI1umxuAbLTUxFDF0/ResMI8gSjwFoete9UNX764R5ate9Zq1wAebCy1m5YEIBquaJWK1igvI2V14oZgbZ4eimRpo4eu55VUWtt8/3em9ssgP/sgz3W+lbdaXqzRqEpF4+cqNq9khyh+O8pBTaXHG0sOUV6Irwy/A5LICyBsARuVgJ3BMRVSfGb4vc+ywj1/+drL+BrT6zDYnJ54iIdD4M2pB20HEg0xNjYGFq7+rDl0GmC+fv4D3/xD/jfv/MLaI3y5gMncba+Bb0DwxDQKu/bkcbHJ9FN3v5UbSPe3X3EUib/+S9/gv/z71/G376xFXtOVqOtp59FhxAKBuwnRBORLkomx7qivBD/8qUn8VtfeAJ6hrP4N9e5Y+JmfW7XO5xvWAJhCdxLErhjqKJgjCL+Cl4oov3kmgp8mUD+1ac2YM3CUmQx6Oc6DhkIl+AM+1yMnv4BNJGiOHO+GbtPnMVbBNMfbdqFv/jFJvyvn7+LvyWPrmWKH+w/jgOVNdB12jSg9ahamyorepwW/vjkJLRLUJSMfo+OjWN4ZAy9g0NUFr0419IObTTQtvF39xzBP76/C9957QP8uTaDvPohfvL+HmzadwL76BFUsS6tnd3QTkXlxQpDyc/gTm5aMh5ePh9alfPNZx60f3FGa1gVZFGAxBiD8CssgbAEwhK4lRJwbmVms8nLcQxiGWVWdPqzD63Et59/CM9vWAotJVO0PzUpAdE87zoORLOEGPzUho9m0hmHzpzDFJWxFX/x8034cyZx0v/4/m68seMQBObbj1Riz4kq8ta1OF5dbzdyCKAF8EpaAXOytoEUyHkcIijr2m2HKvHevmN4bfsB/MOmnfjb1zZTUbxHRbHJrvfetO84jtfUQzvi7KYL1gkMuip4G8O6plMBKZq9flEZvvDwKvLfG+xmj/KCbLtxZDZyCV8TlkBYAmEJ3IgEnBu56Vbdo+VAWn72xUfX4ve++hz+3TdfxGc2LsP8wizE+CPhMvhpSE8Y4yCkf6QtQsFJiEbpHx7FOT1T+TSBffdRfO/tHfifP3kH//vf/gL/3z//Ef7tH38f//qP/h7/6o/+Hv/6f34Xv///fA+//8ffw+/+0Xd57Lv41/z9b//k+/iPf/ETS5H86U8J2Jt24739J3H4bD0aqTSGabEHtMqEZYrmgV5SLqwT+JkUF41Fxbn48uNrWf/n8e++8Rn7lDstgUP4FZZAWAJhCdwBCdxVEHcdxz4rRHyxtsauWzQXn31wJbST7tvPP0wLfRmWk1vOSk1AlM9L3GR1jZKLQAh2K7J9BGbvAERxNLZ1QqtcapvacYa8+cm6JpyoaaDVXY/DVedxmJa8LGo9VEgWeVV9KwOmbRAF09jeCW1CUhBTa7+13TbIMmDLc+A6LmKjIlGYmYo1tLileH6Ndfy1F6bquXJ+MQqz02zgUrTRHei7cBFhCYQlEJYAiIj3hhSixSmnJ9st2V98bC30x2G/+sR6PLN2CdaSM9cmAm0myExJQlJ8rH2eg8/jwmX1jaU3iLghJv4OGYMJIvDYZADDYxP2mRV6lnLv0Aj0LIqR8QmMTQTsNUFeb9/Kg0l5ubxfD0/SE9iSE+ORlZqMwpx0LCrNwwNL5uLFB5ZBj2L9Jy8+Qv57nX3uidbEu44D3orwKyyBsAR+ySVwB5vv3MGyZl2U1lBrZ9baijJ8/dmN+A/f+gL+j3/+Zfz+rz6PX316PR5ZNg8LyDdnJMbBH+GdWrInAKW1bFwPLAWj7zY5/H1pcnlsJul6F+C1PAjHGCqICOSkJmFJSR6eXr0I337hQfz7b30W/+c//5KlTWSFL55TYK3uWTcqfGFYAmEJhCVwGyTg3IY8bzpLAanP60FctB963oZoiorSfGul66E4WtUiK/hfvPQUfuPzT+BbDI5+6fF1djPNI8vn29Uuy+YWoqIkF/MKslBGK7qEVIfSnLwMy7lreaOoGj2r49GVC2hdr7APN1K+elDSP//84/gWqZKXHl2Dp9Ystk94m1+UiwLSKalUHjGkVrz0BG66seEMwhIISyAsgZuQwD0J4pe2x3UcAnqUBdDl5cV4gqD6pSfX26cl/vMvPIF/+rnHaS0/hK8+uQ6ff3glXli/FM+sqcATqxbisRUL8DAt94eWlkNJ33XsydULSdVUELyX4gsPr8LXnlrPPB7Gb1ApWAB//mG8RAB/ZMVCVJQWIJuWuT8ygtz4fSEyhF9hCVyfBMJX368SuK8RSUv89JCbAlrHi0h9bFhcjmfXLcMXaZV/49kHyas/ht+itf6vvvIcaZAXbPqdLz2L3/zCk9AjML/+zIP4wiNr8fS6pdDjAPR0OT3TRB5A2Mq+X4d0uN5hCfxySeC+BnFjjOXDtRpEyxXjY/wMesYgjXRHenIC9JS4LFrQ2v6ew6CpTWnJDFQm2XOiakSNSBEIuKOjIuxzm13XYYDS/HKNhHBrwxIIS+C+lIBzX9Y6XOmwBICwDMISCEuAEgiDOIUQfoclEJZAWAL3qwTCIH6/9ly43mEJhCUQlgAlEAZxCuFOvcPlhCUQlkBYArdaAmEQv9USDecXlkBYAmEJ3EEJhEH8Dgo7XFRYAmEJhCVwqyVwdRC/1aWF8wtLICyBsATCErilEgiD+C0VZzizsATCEghL4M5KIAzid1be4dLCEghL4OoSCJ+9TgmEQfw6BRa+PCyBsATCEriXJBAG8XupN8J1CUsgLIGwBK5TAmEQv06BhS8PS+BSCYR/hyVwNyUQBvG7Kf1w2WEJhCUQlsBNSiAM4jcpwPDtYQmEJRCWwN2UQBjE76b071bZ4XLDEghL4FMjgRkQ118YDicgLIOwDMJjIDwG7pcxYBXR/wsAAP//Ej+v1AAAAAZJREFUAwAtJAnOdmCmTwAAAABJRU5ErkJggg==" alt="Souza Cardoso">
          <img class="logo-img paulistana" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABrPSURBVHhe7Vz3d1bXleU/mFlrVlzoCHCZJM5KZuw4xYkzkzIzHtuJk5lJJplfZtzAgKTvk4Q6vdmY3gSYYkyRhHrvEh1E76hXkAQCSagX9px93rv6ngS2SWxYUpY2XL1y+zn7nnvue/d9ozDEcE9Cn/zts//inhy7e9COHiuBQO6iW/709Uiq3j709t1Dt6TuvSc55LqPcZKGZTH0yt8eu0SFffiq6JN670md9+5JDdLO4YxRBvb1kEE/Iahc0SwFLhrF3dp6HNu6DZXHC9B+t95KLJAoUTYVDnTJsV3udFL5zKesEIXpP0ORrw9snxO3b9/BsWPHcebMGfT2smXDBzYdhhIh+qmgfznqe8QCyIBXVXZeLUPkd36E/c88j0P/8ydc2RKBm0WX7XwWmK6nV0oQdtzrlkCdSDkaNPYvJ4QS8wFoa+/AhYuXERMTh4WLlmDmLB8kJacIWUYI8TXAjGWaf45ysQDyp0tiOktLkPy9l5Hz5GikPvEk4sdORvbLP8eRaW6UJySh7XqFpLKmFeZrFWJ00crwBq0E2fE5Sv0ikAgc7U5r0N3djarqaqRnZGHFytWYHRSKmb5u+PrPho/LH6lpGTqdDCfYdBi6U4aoQBRrjWrea6suw6c//gminhqDtPETkCoh/clxSH5yAmInP4/En/8KxxcuQmVeDrqbb2se0oPjlD5EPyG+gp4aGupw+NABbN+xHWHhc+Dr8oO3BPfsELgDQ+EnwdtvNlLTMx0EYoVfodLHBJsOQ48QhIqQFoJml6NbRltPdzsqTxzDscXLkPrLNxD/7AuIHzMBmU+PR9b4iUgSgkQ9OQZxz30PGW/9ERfXbETTuYvo7Wy1ChWQXxy4nFasGaRPnFHrH+ujNVDfg8FGU3MLzp2/iE8/24NFS5aJBbBI4Dc7GL6ifFdAEPzFQvgFhn0OIYYHbDoMTUI4QdX0UH8eHaGtoRbFcbE44ivm+QevInq0F5JHT0TW2EnIlJD0lIQxzyPlmz/Ggfd8cClqH5qqSiSnNaXQavCsT6aCe2L+7wnxaEV4n+js6sS1omtITk3Fsg+Xi/IDMYtEEGX7BYbI1BAoU4QfgsPnYZ4QNCDYIgODTz8hHA0eBrDpMPQJQfTIiGVQJ1HkbETdfa8Lt4ov4+qnnyH/D/+L5L9/CQljpyBRSJE2YTIyx0/BfrEieydORdrP/g1HRWGlWRnouF0vZVhL1T5lm9TR04u6GzdQkFeAjZsixC8IxixvH/gHBCJgdhB83X6Y5eNCQGAwlq9YhdSMbBSXVyIpNQOzQ8JlygiBX1DIiIV4LKCtv9cjI1hWHTwXJZIcdDbNqO5pacLNU8dRuPwjZL3+H+JjyJTy9DikTJqI/LETceDv5PxpL0Q+/12kv/ZbXNi8Ax2td9VSlFbVYNfu3ZgnI94lBPB2ueEnDqK/BPoJbj9/LFq8BHv37ZMVxUW0trVZlQpy8g+o1XAHBAshRqaMxwSOZy5He2VUSxA2qMMpVqNb7vI5BCErTSXN3Rs1qEnLxPGAMCT9+BdIH/88csVaJE+VMGkqUv92POJf+Rd0lpVpvrScPEwLcMPb7Q+XmH//kFDxC4IRGj4X27bvxPETJ1Df4Hn2YcBas/ML1IegYzniQzxikAbq4Fn/+0FR918LOegD0BnsFWexu4drFAtdEtdWXYUr6zYi+R9fETI8g6xJzyL9CS+k/urf0VlVquly8g7CNzgIs8VBDA6aIxbCH+siNuNGXb2U6VAspy2S0VY2/2aLhfAPCrMIIcQY8SG+Ljjkx1OqVR8Li/C7RPKd3b1oLq1E67Vi3C0rQUtJMdqqqtDb0SnCF8sgfzS9TQzqsdMqDs0Vpch98/dIGuuFLK+pMnVMRsY/v47OmnKNzz14UHwAOoxCiqBwTJ/li5j4RI0bCFLA01BeZeUd0CWn5UOIhXAHICUjS5+fWODR0bkhCpsOQ5gQolg9F8HykXRLVTU+e+O/kPAPP0Haiz9F3IuvIutP76Clkg+kmF4mkz6uGOgq8s1Fr+YjGkuuIPPN3yFh3ARke3kh40lZjfzT6+iyCZF34CBcswNEqVxChgkhXIiKjde4gaq8/yojO1dWIP4aOOVMm+mNpOTUkSnjK8Mha57qdMEjiSGy7bp8DbHf+xHSv/GULC/HIGHMeKS89hpaKricZHo+txAa8KmikIH/hBuKxmtCiF//J+LGT0TGZI+F6Kq2LYQQwj3bshCGENHxSRpniGnBeW7FnT5zFps2b5GwFRFbtmL9xk04Jj7HwHxDHzYdhv6UIX/0ulOmif0/eAVJE8Yifep4pI2bJKuJXwshLKVy1dErSwZZPaKHxGAZdplN1SXIeuO3SB0zEZlezwiZnhFCvNFPiLyCg/CzCRGgU4YLkTFxGmdAovWyAgfYPj7G7uzsRBePXV163t1j3NzhA5sOQ9lCWOCUwfPOyjIhxM+QPM7yA/KfehYF//o73LUJQSsiOuvPR4Pdc6cJldkHkecXjIxvv4Q0r4lInzIFmU9I+Olr6K6yVhk5eQXw9fODvxIiDD7+gVi07CPEiZW4WlQkSuYC934oYf9KYNNhCBHCAaegzVlXeRmSXnoVqeIYpk9+BuljnkXam2+hqdxMGRa6W9vQcPI0zq3ZiPTX/xvx3/wh9ovPkDfeC9mTJkn+iYj8m3GI//nv0FdeqXkOHTuhD5dmznLDz209ivY8jZyLVes2ICsnH9U1tdI2j29gPe7mVCUWgSZKaTg8SWLTYegSwpDCQ4hyJL34E6TLVJHhNUUIMQU5v/4NWqvLNE1jRRnO7dyFvLenI+GFFxE3eiKSxk1EijiSGaMlPDEJ8WOeQ+xPf4kjc+agIisXvXeb6WmgtbUDF64UYW9cIhaKZeDSkYHvKXz9g+TcIkfonHnYuXMnjh49itu3b1sNszHcnMjBsOkwvAiR+BIJMRE5k6Yic+wzOPqLN1CxeQeO+YUh9ZVfIXnSc0j7xmjkPj0G+ePGInHs04gcN16c0ZeR9cf/Q9FnkbhTVszS9CFWh4xsLlH1HZpc816DKPrk6TPqIM6ZOx+zfHw18PE1n156e3vDT6aXJUuWIDo6GpcvX0ZTU5Pk9MC0eTjBpsPQJ4RBV1kZ4r8vhBCTnyuEyPP6lvgE30Hc5G+J4sVaPOWFg6MnIZsvtkZPQcLUF5D+1u9xdvUa1J0qRHdXmzqaLJVeCZWvRJDQLTe5WHWCq4Tq2mpkZmdhw6aNCAwOhI/bBbdMJb5+AXLuDxcfbwtRVq1Zrw+jyiorxaG13pgON1LYdBhGhBAfIvZlEkKULoTImvRN5Ix/ARkTpiCVr7+FCAkTvo2UV9/EobAFqCrIR3v9Tc1LIvAhFa06CaAzPYundVAykACM5ONx/qNCPfXz3UVJaQli4uLE2VyuD6FmyBTSP6XQ33D5Iyh8HpKFGG3t5pEYwXIG9mUowqbDUCYE1eIRJS1EzMuvIGPsBOR60UF8TsjwLcSMnYr4F3+IQz4uXI2MQntNlaT2LA/56FmXjBy51DkLlCNJwQvWwlffPGe9XDAqJZQgVjucuN3UjEKZUnbvjcS8hYvESgSIxfDXvREzvH2xacsnuofCA2cvhi5sOgwdQgwUGRXSq8qxnjsCbRVF2C2Kz/nGOOSNGYfM0V5IfOH7uLB6NRqvnEVnd7OlZBtU/EArM3DUf1Ww7NraWhw4cAAbNmxAeFg4pk+fjoiICLS0OAkxPGDTYWhaCFWeTPAUOk06j+2V5djz2ltI/Pb3kfjdlxH5wg+R9oe30VFmPbrmTmvuoaTKyQPmexRgWwbvqO7p6UG5OL3x8XGIiYlBQ0ODHTN8YNNhqE4ZEsTUM6idF/n3tHfgpnj0dWcLcePiGdSeO4ebRaXo6OhCu2i/QzKZTbXW7qeBpv7rAgnBYM4HLzfbxN/o6Oiwr4YPbDoMJULo2NYzjm711kXY+uBHrgeOSQ+oDvXqmdY4CTr/PxpCPAiGIMMZNh2GGCFswVL5XaLQHvEj1MHj9EGCcEQymSRQnTOXZpM/GmEIYt0fwcPDpsMQnTIkWMq3zTM1LIHnziB/rAwO8I4JI3h42HQYqk7lCB43bDqMEGIEFmw6jBBiBBZsOowQYgQWbDr8eYRQR84+DnDuBsG6z+PDO3dM93llfXEpJv6L0lgwKR4utaSRpYz0xL56eBhnWOt5QJ8IS0YP1QomttPr6X0wcZqWLbbTPCCpndYTDGw6jBpVd/MWSiurUFZRiXIJZeUVeqyqqsb1G3Vosx+yMLO1jUyWgvp8wPNQpqmpWfJVoqS0DDdvNWpD9N2BnDgbxa1ltddvoLSsHFXVtZrGNIzb1hma7jRK/RUoKa/Crdt3JM7aZs96b966jeIKaau0t7mlRfOJ+B3BWRtQIen4XebVa8VouXu3v826gpH4lrZOlEs/L16+gjNnz+HsuQu4du0a6hrq0dHZIe3r0w+DamprUVJSIu0uk3ZVotSWVUWlyEvaSpmx7zXXa9HZ3YUeba8sm/Vpa5/KsLKqRvtdLf1mG5xyNOD5XWlnudRTVlaKuy3Nel/Ti+zMsru+4ZbWV1FZjabmJkcZljyscmXp3tOLmhs3UFxervptt1+6GTk467bpMGpUdFwCAkPDEBI2ByEhYQgMDkWwHIPlGCr3+FnbwUOH9ekbC+AeQmdBvL/1k20IDArR/QIbN21WxRGqcD2z0Hj7tsa7/QL0m8n2Ds9bQUOOAwV5Un8I/ANDkJWTq3F84MTHw4nJqXDNDpb2zsGpU6etOD6QeAAhWNa2bTvg7ePC4iXLUFxifYPB9D2ijBOnzmDNhs0IDAmHv3+gtMn6Sot7HYJDQxAdsx9t7e1a4pq1a+B2uxEUHIzZwSEICgtXeYWGhmu/rb4HYM26tbhRX6f1GDIxf25+vuQN1T0V8+Yv0D0UBJXC4ERxcQkCA4M08B1JVRVf1kla6Y+Re6zobJa3r+7XOHXGkoMFxnsUXSR9nrdose4VpV5TU9P76xtcr02HUaP2Rsfq7qAAUUBkVDQOiPJz8/Ok0nj97QMK1CVC4jP6dgrI0TAiOzsbfgH+Kkx22sfXjZTUNBUIU3lSArcab2P1mvWY/sFMEcxCtLa12zHssHXMz8uFf0CA7lDKzM6xbkopHHEJicn63YNLFMivqTTmiwixfYcKbtHipTqi7BicO3cOwWFzMW2mD1auXovCwpO4cq0IFy5c0v6sXb8OKWmpatHYj8KThcjKysKBgweRnJaB+YuXwFv6SSJwy31+fgGyhbwnJN3dtlZthdV7yMgsx/yFC1WOTO/rdmHlqpX9L8CcsiSKhBBsMwcNZblk6YdiwWwC2Ukjo/Zj2rQZKu/CUyetmwqrZqKtrQOfSP+nz/IGv0LzCwjUAX/lyhWN/1xC7IuOgy+/WJJRx8Y40SDTyeo16+DjcsNfSHH9+nW9bzpRIeZy0aJF0gFv7NkbqT+gwc7Qsly8ZFXsBH9yZ+269Zgx0xvzFyzWX19ROIRSIBYiMChIFZ+Va1kIgtNJYnKK7nWk9aAS7RhH8JTDNm7fsVPa41KhltovwYj0jAz7O4oA/SCnq8ver+8AzT0tCQnhxJ3mFqyLiBBCuNSS3pHp0glVid2f1vY2Uco2fDBzppBgjRDqMBYsXAQfHx8kJCRoGguedpO4/HLMn1aH+y683QgNn4dDh4/qB8lEZFSMDqoQsVD3WwirrIKCg5Yu5s7VD5E2RWxRua9bu1anJcJJRpsOQoioeN3kESxKLCq2zKpBVU2tWIk1KtQgYdkN8SkMOFXs2LEDM6WzS5d9KHN0m8zrd8W8rsc0aeyGjRF67cTtxjsafx8hHALJz89VQvgqIfLsuxYhEoQQtGb+Mm2cPHnKxDiCpxwPIXyxRKaMUpnnDTj3L1+xWoTt0l98WbxkKbZs3aY/C3Tq9GlUVFWKL2CRxGmqiZsy7a2TaZQWgoSg1SM4OVr/rFYwHDxyGG5/fwkBOFFotTc2PkEIIeZ+zhxcumSNfGe7S8TPIFF9/QKxesMmrBCL+oG0k7uz4iQvSRoTG49p02fItCWEOHvGzklY5VyvvY75YoFnSt/3Ru/Xe+cvXlIC+fj6ytSRqvceSIg9UbFwi4D5GwfbP92N5PQMFXxUbByWLF+BGT5u3WRKU8nt6KaMQ4eP6LzJDSIFh46KA9OHbok8Ih3nxy5q8nPz1cyZaulbrF23SQmxUOa2NhlBFGFfL7+4sth/4ECBECJQp6DMLDNlWD5GYpJYCBEWt60V2oRg2TTPDPrmwx7R7Cw/1PVYCPv7DZ1iLH8mRyzQ7t17sEpGL825y+2nZjo4JBSf7voMdfUNWr4TtyTfho2bZQoQX0MI0SgkJ/Sbz17u0bTKr5HBM1f6OG2WL7bt2o2m1nZRpjiodfVYIv4TZRCxeUv/ZhpjiUrEoeRPD5Bw0ftjcV3Sf7Znr8jTpVZtn9zbtHW76iVIBvHJs2e1jfpzCRK6e7plIHxq+U7S7xJxJllvW1cPdu7eBx+RX9hc8WOuFml9zEOZ2XSwfAgSgoHbz+lgBojjNFuO8xcvQ8QnO3D85Bm0igNoGFUjK4Wl3J0sjfZ1+2OBjLAlH32MpR+twDyZrzmK+Vlb6Nx5KLbnbubsFNP8ySc71dzNnT9fVjfWNngn9ovvQpLNFgUdOXrcvmsRIkkI4ZJy+ZsNXBV8EejFkxAUjJMQvD8YdG7puV8rKsbuPft0/n7v/WlIS8+0U3jQKNMerd8sMeUWIczua3tnlgSa9p1CApp+VVz4XCz7eBUWSjsWCxn4GxO+Ese+ZGRmWUqxmVcq8nLxx0mk3fsio/XjZb7ij5OpzU/ykRScSvizBSREoRCC6Lb7dfDwIfUt+ONnrGep1Ld4mYQPP0bovIWqm5nSpk0RW9HSav2sAdts08EiBE0UiXD4+HH1G67X1emXz9wuxq+gDGg+Kbw9e/dphfRyd++JVBO2TxxShmgxu3RO58xboKOAwuugZbHLyBMHjKN/lsuNles34viZcyiSpdwVma7Sc/KFiHPEEfLBqrXr1Ocw4M8A0UIYQiQmJasCL4uTdPmqFc5fvCCjuk4FzFVJ/5QxwELc080su3bt0t1ORUVFqL/ZgLutrbokTk5JU0LQJGfleCyUgSEEv+EIEqvKa4IWwliHI8eO6YqCloxb6iyZ7EekmO/o/TEqL/pmVPocGTQeh9fyISgfixBR/Sux7u4e5OTli68XroPQJW1UH+K0RQiiRqYKrqiYd/nHK3U1EiX1Rkm9++TI6x07d2n/LAucrWSgTGw6jBq1S5zB92TEco6ip/0gqEkSYnQL8+kYUdEc5VSQlPVAJCYmSrqZEmapkGm2qKS2jnYdefMXLrZGkEwt+qNdEvgJHS3Vmg0b+y2LWbp2iUBi7OUWpwESw0+Xi37SdreGd99/T+pKtvJJRzdFbJaR/oES1yw7+btVXDGEhYWpc8dlZlh4uPg0C3VkUVCcPmgp6DAaq2hQ33BTlLkW7773gbaBz10IfqxDVIrVWyCrirfffQcrVqwctL/SA5KZ9b3z7vtYL76CIRbvvz/tA5Xvbpkq6GeRZqYVJ0+dklXTIomfIUthv37nmktkThVvv/O+tv9BTj1B4q+Vwfa+WMAQWUabVYdNh1GjTp8/j1hRXrKsUeudW7+0BfxjNYVed7uM9IOHjqj5ysjMVjN7P6xR0th4S5dwsXFxyM0rUKZzntSHK1JmndR1+OhRxCckaXlxouzMzEwh5VV0dFmfzpFENJk0pyQGO5ki7UxNS1eSccmXJAQwISYuVtJcUiWSEEePndDP8bJz8tTysSecL/n9JVdMx8Uikrgx4i9x1LItWdm56oAqgfVnBTwWkmhuaVWPPyExRX9+sFkUzjJ7ZO6mhaCAWWZycjKuitUiLL/FkqMBCX78xEm1dFxO0yLTcWY7ExKTNJwW60nravVfpGaTs7S0WB1DhuqqKpUp81EnsXGJqqOubvFpJPnAWq0BUSZ+Soq0L050c/HiRX22ZNPhyx5dszirSDaGDXaCVxSCZxTRsaFjN/CjWIJJmJbC6+UOly8BO0mlKImkXl4/LFjH4JFN8J4JXwZTrzPlg/LymuSjoGkBB4P3BhNCB4WU7wRj2d/B4ECw+m/J7kE/iGoGmhPM5ySRVQPbf39+ttGmw6N/ueUU4GBhfhkGpP8z8w4VfFGfGafxdpo/Vz5OmLzO40A6D8Tgumw6jLztHHr4y0nxVWDT4fEQYrAJH8DiQcF532lWnWWYeGe6wecEz00gTBoTHnTPBGeZBqYsZzpnGnN0YnC6wcGkMcfBcY8LNh0ePSE4P3WJk8jHpXx+z/chvKZjx3P9sQ37mk8/W8UL5jXnZd7jtnae0/FxxvGacaYMls2Pbnk0P+LBOJ6b8k39zM/21Mny2ry0YxrGs0y22Sjf1NPc3KxHUzbzsyymMXWxHJ6bPCyP10zD9Gwfy2Yw+VkvrxsbGzUt22P5JPf7E48SNh0ePSHYaa77KRwqtLq6Ws/5Fo/CuHHjhoaamhrU19erUO7cuaNxN2/exIULF1SQFBBfQTM/7/Mev5xiWsZRAfpMQcrgNd+zMD2Vc+vWLV0OUthUBO8xnflym5/2c9XBtrJspjXgRzeMY9tNWradZVGJpj0nTpzQNvCaaahk5mVb2Be29epVWUFJPqZj29guevys95QsJ9mm0lLzVvav1EKws+wkRxiVTeFSsLxHIZEsVBKPHLFMT0ExDRVWXFyswjMKoRJ4n8ImiczIIhlILAqSguXyjwqgglgn452jk8stKoNlM55KZh0s75IsXc0oZZuocLaLeVk2y2SdPGd+5mF9vKZiSQjmNV9wkWCMZxvYZsqC9bOflAP7VVhYqPm5H4NlMzxOUth0ePSEoGApTCqfQufo4IjhyOa5OVIAFBYFRIXxHgXLtBQsr415Zx4KlQpk2TynwEkeCpnBlEtlGpN8/vx5FTrjmJd18pz1GVJS2czHPGw762d5jDMjnxaOZCJZaG3YBiqVcbzHso3VYh2MY/lsP+tjevaTVoxlM43JRzmRFDyyjMcFmw6PhxAMRsDspAm8R4E6z016BsKkHRzHe4OvTTqWZWDu8x4FT6UwPYnlLIPXDDxnWpPPxPGeM87UY/KY9M46nXE8MhC8b+IHB3PfHB8XbDqMYAQjGMHnYtSo/wc85OJNdrE9mwAAAABJRU5ErkJggg==" alt="Paulistana">
        </div>

        <div class="contract-title">
          <h2>CONTRATO SOCIAL</h2>
          <h3>${esc(e.razaoSocial)}</h3>
        </div>
        <div class="contract-line"></div>

        <div class="contract-intro">
          <p>Pelo presente instrumento particular, na melhor forma de direito, à parte,</p>
          ${qual}
          <p class="resolution-text">${esc(resolucaoConstituicao(socios))}</p>
        </div>

        <div class="clause-title">CLÁUSULA PRIMEIRA - DA DENOMINAÇÃO SOCIAL</div>
        <p>O nome empresarial desta Sociedade, é do tipo denominação social e, compõe-se da seguinte expressão: “<strong>${esc(e.razaoSocial)}</strong>”.</p>

        <div class="clause-title">CLÁUSULA SEGUNDA - DO ENDEREÇO DA SEDE SOCIAL</div>
        <p>Esta Sociedade terá sede na ${esc(fullAddressFrom(e))}.</p>

        <div class="clause-title">CLÁUSULA TERCEIRA - DO CAPITAL SOCIAL</div>
        <p>O capital social da sociedade é no valor de <strong>${money(total)}</strong> (${capitalize(esc(numeroPorExtensoSimples(total)))}), totalmente subscrito e integralizado em moeda corrente do país, dividido em <strong>${formatQuotaNumber(totalQuotas)}</strong> (${capitalize(esc(numeroInteiroPorExtensoSimples(totalQuotas)))}) quotas no valor de <strong>${money(vq)}</strong> (${esc(numeroPorExtensoSimples(vq))}), em moeda corrente no país, conforme segue o quadro abaixo:</p>

        <table class="quota-table">
          <thead>
            <tr>
              <th>SÓCIO</th>
              <th>QUOTAS</th>
              <th>%</th>
              <th>VALOR</th>
            </tr>
          </thead>
          <tbody>
            ${capitalRows}
            <tr class="total-row">
              <td>TOTAL</td>
              <td class="num">${formatQuotaNumber(totalQuotas)}</td>
              <td class="num">100%</td>
              <td class="num">${money(total)}</td>
            </tr>
          </tbody>
        </table>
        <p><strong>PARÁGRAFO ÚNICO:</strong> As quotas são inalienáveis, incomunicáveis e impenhoráveis, não podendo ser liquidadas mediante requerimento do ${esc(socioAdministradorSingular(socioPrincipal))}.</p>

        <div class="clause-title page-break-before">CLÁUSULA QUARTA - DO OBJETO SOCIAL</div>
        <p>A Sociedade tem por objeto social, ${esc(d.objeto)}.</p>

        <div class="clause-title">CLÁUSULA QUINTA – DA RESPONSABILIDADE ${socios.length===1 ? (isFemale(socioPrincipal) ? "DA SÓCIA" : "DO SÓCIO") : "DOS SÓCIOS"}</div>
        <p>A responsabilidade ${socios.length===1 ? (isFemale(socioPrincipal) ? "da sócia" : "do sócio") : "dos sócios"} é restrita ao valor de suas quotas, mas responde solidariamente pela integralização do capital social.</p>

        <div class="clause-title">CLÁUSULA SEXTA – DA CESSÃO E/OU TRANSFERÊNCIA DE QUOTAS</div>
        <p>As quotas são indivisíveis e não poderão ser cedidas ou transferidas a terceiros sem o consentimento ${socios.length===1 ? (isFemale(socioPrincipal) ? "da sócia" : "do sócio") : "dos sócios"}, a quem fica assegurado, em igualdade de condições e preço, direito de preferência para a sua aquisição se postas à venda, formalizando, se realizada a cessão delas, a alteração contratual pertinente.</p>
        <p><strong>PARÁGRAFO ÚNICO:</strong> É vedado ${socios.length===1 ? (isFemale(socioPrincipal) ? "à sócia" : "ao sócio") : "aos sócios"} caucionar ou dar suas quotas em garantia, seja a que título for.</p>

        <div class="clause-title">CLÁUSULA SETIMA – DA DISTRIBUIÇÃO DE LUCROS</div>
        <p>Quando houver a distribuição de quaisquer lucros e rendimentos, a distribuição poderá ser feita tanto de forma proporcional quanto de forma desproporcional.</p>

        <div class="clause-title">CLÁUSULA OITAVA – DA ADMINISTRAÇÃO</div>
        <p>A administração da sociedade cabe ${admins.length===1 ? (isFemale(adminPrincipal) ? "à sócia administradora" : "ao sócio administrador") : "aos sócios administradores"} <strong>${esc(adminText)}</strong>, com poderes e atribuições de representá-la ativa, passiva, judicial e extrajudicialmente, sempre na defesa dos interesses sociais, sendo de única e exclusiva competência os negócios patrimoniais, trabalhistas, previdenciários, tributários, financeiros, comerciais e todos os demais atos necessários à gestão da sociedade, respondendo quando for o caso, pelos excessos que vier a cometer, autorizado o uso do nome empresarial, vedado, assumir atividades estranhas ao objeto social ou assumir obrigações em favor de terceiros. Todavia, poderá onerar ou alienar bens imóveis da sociedade.</p>

        <div class="clause-title">CLÁUSULA NONA – DO PRÓ-LABORE</div>
        <p>Fica facultado a retirada de pró-labore ${socios.length===1 ? (isFemale(socioPrincipal) ? "da sócia" : "do sócio") : "dos sócios"}, ficando a critério ${socios.length===1 ? (isFemale(socioPrincipal) ? "da mesma" : "do mesmo") : "dos mesmos"} sobre sua retirada e valores.</p>

        <div class="clause-title page-break-before">CLÁUSULA DÉCIMA – DO EXERCÍCIO SOCIAL</div>
        <p>Ao término de cada exercício social, em 31 de dezembro, ${admins.length===1 ? (isFemale(adminPrincipal) ? "a administradora" : "o administrador") : "os administradores"} prestará contas justificadas de sua administração, procedendo à elaboração do inventário, do balanço patrimonial e do balanço de resultado econômico, cabendo ${socios.length===1 ? (isFemale(socioPrincipal) ? "à sócia" : "ao sócio") : "aos sócios"}, na proporção de suas quotas, os lucros ou perdas apuradas.</p>

        <div class="clause-title">CLÁUSULA DÉCIMA PRIMEIRA – DO PERÍODO DAS ATIVIDADES</div>
        <p>A sociedade iniciou suas atividades na data do deferimento de seu registro perante a Junta Comercial.</p>

        <div class="clause-title">CLÁUSULA DÉCIMA SEGUNDA – DO FALECIMENTO OU INTERDIÇÃO ${socios.length===1 ? (isFemale(socioPrincipal) ? "DA SÓCIA" : "DO SÓCIO") : "DOS SÓCIOS"}</div>
        <p>Falecendo ou ${socios.length===1 ? (isFemale(socioPrincipal) ? "interditada a sócia" : "interditado o sócio") : "interditado qualquer sócio"}, a sociedade continuará suas atividades com os herdeiros, sucessores e o incapaz. Não sendo possível ou inexistindo interesse destes ou ${socios.length===1 ? (isFemale(socioPrincipal) ? "da sócia remanescente" : "do sócio remanescente") : "dos sócios remanescentes"}, o valor de seus haveres será apurado e liquidado com base na situação patrimonial da sociedade, à data da resolução, verificada em balanço especialmente levantado.</p>
        <p><strong>PARÁGRAFO UNICO:</strong> A sociedade não se dissolverá pela morte, incapacidade ou retirada ${socios.length===1 ? (isFemale(socioPrincipal) ? "da sócia" : "do sócio") : "de sócio"}.</p>

        <div class="clause-title">CLÁUSULA DÉCIMA TERCEIRA – DO DESIMPEDIMENTO</div>
        <p>${admins.length===1 ? (isFemale(adminPrincipal) ? "A administradora declara" : "O administrador declara") : "Os administradores declaram"}, sob as penas da lei, de que não está impedido de exercer a administração da sociedade, por lei especial, ou em virtude de condenação criminal, ou por se encontrar sob os efeitos dela, a pena que vede, ainda que temporariamente, o acesso a cargos públicos; ou por crime falimentar, de prevaricação, peita ou suborno, concussão, peculato, ou contra a economia popular, contra o sistema financeiro nacional, contra normas de defesa da concorrência, contra as relações de consumo, fé pública, ou a propriedade.</p>

        <div class="clause-title">CLÁSULA DÉCIMA QUARTA - DO ENQUADRAMENTO</div>
        <p>${socios.length===1 ? (isFemale(socioPrincipal) ? "A sócia declara" : "O sócio declara") : "Os sócios declaram"} que a sociedade se enquadra como ${porteDescricao}, nos termos da Lei Complementar nº 123, de 14 de dezembro de 2006, e que não se enquadra em qualquer das hipóteses de exclusão relacionadas no § 4º do art. 3º da mencionada lei. (art. 3º, II, da Lei Complementar nº 123, de 2006).</p>

        <div class="clause-title page-break-before">CLÁUSULA DÉCIMA QUINTA - DO FORO</div>
        <div class="contract-closing">
          <p>Fica eleito o foro do município da sede social da empresa, para o exercício e o cumprimento dos direitos e obrigações resultantes deste contrato.</p>
          <p>E por estarem assim justos e contratados assinam o presente instrumento.</p>
          <p class="contract-date">${esc(cidade)}/${esc(e.uf || "SP")}, ${dataExtenso(e.dataContrato)}.</p>

          ${admins.map(s=>`
            <div class="signature">
              <div class="line"></div>
              <strong>${esc(s.nome)}</strong><br>
              <em>${capitalize(socioAdministradorSingular(s))}</em>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function socioQualification(s){
    const nasc=s.dataNascimento ? formatDateSlash(s.dataNascimento) : "xx/xx/xxxx";
    const estado=genderizeCivilState(s);
    const regime=s.estadoCivil==="casado" && s.regimeCasamento
      ? `, ${String(s.regimeCasamento).toLowerCase()}`
      : "";
    return `<strong>${esc(s.nome)}</strong>, ${esc(genderizeNationality(s))}, ${esc(estado)}${esc(regime)}, ${genderWord(s,"nascido","nascida")} em ${nasc}, ${esc(genderizeProfession(s))}, ${genderWord(s,"portador","portadora")} da cédula de Identidade RG nº ${esc(s.rg)} ${esc(s.orgaoEmissor)}/${esc(s.ufRg)} e ${genderWord(s,"inscrito","inscrita")} no CPF/MF sob nº ${esc(s.cpf)}, residente e ${genderWord(s,"domiciliado","domiciliada")} à ${esc(fullSocioAddress(s))}.`;
  }

  function renderHistory(){
    const list=document.getElementById("historyList");
    const q=(document.getElementById("historySearch")?.value || "").toLowerCase();
    const hist=getHistory().filter(x=>(x.data.empresa.razaoSocial||"").toLowerCase().includes(q));
    if(!hist.length){
      list.innerHTML=`<div class="empty">Nenhum contrato encontrado.</div>`;
      return;
    }
    list.innerHTML=hist.map(x=>`
      <div class="history-item">
        <div>
          <strong>${esc(x.data.empresa.razaoSocial || "Sem razão social")}</strong>
          <div class="history-meta">
            Gerado em ${new Date(x.createdAt).toLocaleString("pt-BR")} · ${x.data.socios.length} sócio(s)
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-ghost small" onclick="previewContract('${x.id}')">Visualizar</button>
          <button class="btn btn-secondary small" onclick="editContract('${x.id}')">Editar / duplicar</button>
          <button class="btn btn-ghost small" onclick="downloadHistoryWord('${x.id}')">Word</button>
          <button class="btn btn-primary small" onclick="previewContract('${x.id}');setTimeout(()=>printContract(),300)">Imprimir</button>
          <button class="btn btn-danger small" onclick="deleteContract('${x.id}')">Excluir</button>
        </div>
      </div>
    `).join("");
  }

  function deleteContract(id){
    if(typeof window.supabaseDeleteContract === "function"){
      return window.supabaseDeleteContract(id);
    }
    if(!confirm("Excluir este contrato do histórico local?")) return;
    const hist=getHistory().filter(x=>x.id!==id);
    localStorage.setItem("osc_contract_history",JSON.stringify(hist));
    renderHistory();
  }

  function getHistory(){
    if(typeof window.supabaseGetHistory === "function"){
      return window.supabaseGetHistory();
    }
    try{return JSON.parse(localStorage.getItem("osc_contract_history") || "[]")}catch{return []}
  }

  function exportHistory(){
    const blob=new Blob([JSON.stringify(getHistory(),null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="historico_contratos.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadCurrentWord(){
    if(!currentGenerated) return;
    downloadWordFromData(currentGenerated);
  }

  function downloadHistoryWord(id){
    const item = getHistory().find(x=>x.id===id);
    if(!item) return;
    downloadWordFromData(normalizeData(JSON.parse(JSON.stringify(item.data))));
  }

  function downloadWordFromData(data){
    const wordCss = `
      @page Section1{
        size:595.3pt 841.9pt;
        margin:102.5pt 63.7pt 28pt 63.8pt;
        mso-footer:f1;
      }
      div.Section1{page:Section1}
      body{font-family:Verdana, Geneva, sans-serif;font-size:10pt;line-height:15pt;color:#111}
      .contract-page{width:auto;margin:0;padding:0;font-family:Verdana, Geneva, sans-serif;font-size:10pt;line-height:15pt}
      .contract-page p,.contract-page li{font-size:10pt;line-height:16pt;text-align:justify;text-justify:inter-word}
      .contract-intro p,.contract-closing p,.qualification{line-height:15pt}
      .qualification{margin-left:35.4pt}
      .resolution-text{text-indent:14.2pt}
      .logos{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
      .logo-img{object-fit:contain}
      .logo-img.souza{width:220px;height:74px}
      .logo-img.paulistana{width:185px;height:74px}
      .print-meta{display:none!important}
      .contract-title{text-align:center;font-weight:700}
      .contract-title h2{font-size:10pt;line-height:15pt;font-weight:700;text-decoration:none;margin:0}
      .contract-title h3{font-size:10pt;line-height:15pt;font-weight:700;text-decoration:none;margin:0 0 8pt}
      .contract-line{border-top:2px solid #222;margin-bottom:8px}
      .clause-title{font-size:10pt;line-height:16pt;font-weight:700;text-decoration:underline;text-align:center;margin:16pt 0 4pt}
      .quota-table{width:100%;border-collapse:collapse;font-family:Verdana, Geneva, sans-serif;font-size:10pt}
      .quota-table th,.quota-table td{border:1px solid #222;padding:5px 6px}
      .quota-table th{font-weight:700;text-align:center;background:#f2f2f2}
      .quota-table .num{text-align:right}
      .quota-table .total-row td{font-weight:700}
      .signature{text-align:center;margin-top:40px}
      .signature .line{width:260px;border-top:1px solid #111;margin:65px auto 4px}
      .contract-footer{display:none}
    `;
    const content = `<!DOCTYPE html>
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <meta name="ProgId" content="Word.Document">
        <meta name="Generator" content="Gerador de Contratos Sociais">
        <style>${wordCss}</style>
      </head>
      <body>
        <div class="Section1">${contractHtml(data)}</div>
        <div style="mso-element:footer" id="f1">
          <p class="MsoFooter" style="text-align:right;font-family:Verdana;font-size:8pt">
            <span style='mso-field-code:" PAGE "'></span>/<span style='mso-field-code:" NUMPAGES "'></span> ${currentUserInitial()}
          </p>
        </div>
      </body></html>`;
    const blob = new Blob(["\ufeff", content], {type:"application/msword"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = slug(data.empresa.razaoSocial || "contrato_social") + ".doc";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  }

  function printContract(){
    updatePrintPaginationStyle();
    const originalTitle = document.title;
    document.title = "\u200B";
    setTimeout(()=>{
      window.print();
      setTimeout(()=>{document.title = originalTitle;}, 800);
    }, 50);
  }

  function doLogin(){
    const error = document.getElementById("loginError");
    error.textContent = "O módulo de autenticação não foi carregado. Atualize a página com Ctrl+F5.";
    error.classList.remove("hidden");
  }

  function showApp(){
    document.getElementById("loginView").classList.add("hidden");
    document.getElementById("appTopbar").classList.remove("hidden");
    document.getElementById("appMain").classList.remove("hidden");
    showView("home");
  }

  function logout(){
    document.getElementById("appTopbar").classList.add("hidden");
    document.getElementById("appMain").classList.add("hidden");
    document.getElementById("loginView").classList.remove("hidden");
    document.getElementById("loginPassword").value="";
    closeModal();
  }

  function maskCEP(value){
    const digits = String(value || "").replace(/\D/g,"").slice(0,8);
    if(digits.length <= 5) return digits;
    return digits.slice(0,5) + "-" + digits.slice(5);
  }

  async function consultarCEP(cep){
    const digits = String(cep || "").replace(/\D/g,"");
    if(!/^\d{8}$/.test(digits)) return null;

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      method:"GET",
      headers:{ "Accept":"application/json" }
    });

    if(!response.ok){
      throw new Error("Não foi possível consultar o CEP.");
    }

    const data = await response.json();
    if(data && data.erro) return { erro:true };
    return data;
  }

  function setCepFeedback(element,message,type=""){
    if(!element) return;
    element.textContent = message || "";
    element.className = `cep-feedback ${type}`.trim();
  }

  function updateFlatAddressField(field,value){
    const el = document.querySelector(`[data-flat-address-field="${field}"]`);
    if(el && value !== undefined && value !== null && value !== ""){
      el.value = value;
    }
  }

  async function maybeLookupCEPFlat(input){
    const digits = String(input?.value || "").replace(/\D/g,"");
    const feedback = document.querySelector("[data-flat-cep-feedback]");

    if(digits.length !== 8){
      if(input) delete input.dataset.lastCep;
      setCepFeedback(feedback,"");
      return;
    }

    if(input.dataset.lastCep === digits) return;
    input.dataset.lastCep = digits;
    setCepFeedback(feedback,"Consultando CEP...","loading");

    try{
      const data = await consultarCEP(digits);
      if(!data || data.erro){
        setCepFeedback(feedback,"CEP não encontrado.","error");
        return;
      }

      if(data.logradouro){
        formData.empresa.endereco = data.logradouro;
        updateFlatAddressField("logradouro", data.logradouro);
      }
      if(data.bairro){
        formData.empresa.bairro = data.bairro;
        updateFlatAddressField("bairro", data.bairro);
      }
      if(data.localidade){
        formData.empresa.cidade = data.localidade;
        updateFlatAddressField("cidade", data.localidade);
      }
      if(data.uf){
        formData.empresa.uf = data.uf;
        updateFlatAddressField("uf", data.uf);
      }

      setCepFeedback(feedback,"Endereço localizado pelo CEP.","success");
    }catch(err){
      console.error("Erro ao consultar CEP:",err);
      setCepFeedback(feedback,"Não foi possível consultar o CEP agora. Preencha o endereço manualmente.","error");
    }
  }

  function resolveFormDataPath(path){
    const clean = String(path || "")
      .replace(/^formData\./,"")
      .replace(/\[(\d+)\]/g,".$1");

    return clean.split(".").filter(Boolean).reduce((acc,key)=>{
      return acc == null ? null : acc[key];
    },formData);
  }

  function updateStructuredAddressDom(path,field,value){
    document.querySelectorAll("[data-address-path]").forEach(el=>{
      if(el.dataset.addressPath===path && el.dataset.addressField===field && value){
        el.value=value;
      }
    });
  }

  function getStructuredCepFeedback(path){
    return Array.from(document.querySelectorAll("[data-cep-feedback-path]"))
      .find(el=>el.dataset.cepFeedbackPath===path) || null;
  }

  async function maybeLookupCEPStructured(path,input){
    const digits = String(input?.value || "").replace(/\D/g,"");
    const feedback = getStructuredCepFeedback(path);

    if(digits.length !== 8){
      if(input) delete input.dataset.lastCep;
      setCepFeedback(feedback,"");
      return;
    }

    if(input.dataset.lastCep===digits) return;
    input.dataset.lastCep=digits;
    setCepFeedback(feedback,"Consultando CEP...","loading");

    try{
      const data = await consultarCEP(digits);
      if(!data || data.erro){
        setCepFeedback(feedback,"CEP não encontrado.","error");
        return;
      }

      const address = resolveFormDataPath(path);
      if(!address){
        setCepFeedback(feedback,"Não foi possível atualizar o endereço automaticamente.","error");
        return;
      }

      if(data.logradouro){
        address.logradouro=data.logradouro;
        updateStructuredAddressDom(path,"logradouro",data.logradouro);
      }
      if(data.bairro){
        address.bairro=data.bairro;
        updateStructuredAddressDom(path,"bairro",data.bairro);
      }
      if(data.localidade){
        address.cidade=data.localidade;
        updateStructuredAddressDom(path,"cidade",data.localidade);
      }
      if(data.uf){
        address.uf=data.uf;
        updateStructuredAddressDom(path,"uf",data.uf);
      }

      setCepFeedback(feedback,"Endereço localizado pelo CEP.","success");
    }catch(err){
      console.error("Erro ao consultar CEP:",err);
      setCepFeedback(feedback,"Não foi possível consultar o CEP agora. Preencha o endereço manualmente.","error");
    }
  }

  function formatDateTime(date){
    return new Intl.DateTimeFormat("pt-BR",{
      day:"2-digit",month:"2-digit",year:"numeric",
      hour:"2-digit",minute:"2-digit",second:"2-digit"
    }).format(date);
  }

  function emptyAddress(){
    return {logradouro:"",numero:"",complemento:"",bairro:"",cidade:"",uf:"SP",cep:""};
  }

  function getSocioEndereco(s){
    if(!s.endereco || typeof s.endereco!=="object"){
      const legacy = typeof s.endereco==="string" ? s.endereco : "";
      s.endereco = {...emptyAddress(), logradouro:legacy};
    }
    s.endereco = {...emptyAddress(), ...s.endereco};
    return s.endereco;
  }

  function fullSocioAddress(s){
    return fullAddressFrom(getSocioEndereco(s));
  }

  function normalizeData(data){
    const base = blankData();
    data = data || base;
    data.empresa = {...base.empresa, ...(data.empresa || {})};
    data.capital = {...base.capital, ...(data.capital || {})};
    data.administracao = {...base.administracao, ...(data.administracao || {})};
    data.socios = (data.socios && data.socios.length ? data.socios : base.socios).map((s,idx)=>{
      const originalEndereco = s ? s.endereco : null;
      let endereco;
      if(originalEndereco && typeof originalEndereco==="object"){
        endereco = {...emptyAddress(), ...originalEndereco};
      }else{
        endereco = {...emptyAddress(), logradouro: typeof originalEndereco==="string" ? originalEndereco : ""};
      }
      return {
        nome:"",
        sexo:"MASCULINO",
        nacionalidade:"brasileiro",
        estadoCivil:"solteiro",
        dataNascimento:"",
        profissao:"empresário",
        rg:"",
        orgaoEmissor:"SSP",
        ufRg:"SP",
        cpf:"",
        regimeCasamento:"",
        capital:0,
        administrador:idx===0,
        ...(s || {}),
        endereco
      };
    });
    return data;
  }


  function isFemale(s){
    return String(s?.sexo || "MASCULINO").toUpperCase()==="FEMININO";
  }

  function genderWord(s,male,female){
    return isFemale(s) ? female : male;
  }

  function genderizeNationality(s){
    const raw=String(s?.nacionalidade || "").trim();
    const lower=raw.toLowerCase();
    if(lower==="brasileiro" || lower==="brasileira"){
      return isFemale(s) ? "brasileira" : "brasileiro";
    }
    return raw;
  }

  function genderizeCivilState(s){
    const raw=String(s?.estadoCivil || "").trim().toLowerCase();
    const map={
      solteiro:["solteiro","solteira"],
      solteira:["solteiro","solteira"],
      casado:["casado","casada"],
      casada:["casado","casada"],
      divorciado:["divorciado","divorciada"],
      divorciada:["divorciado","divorciada"],
      "viúvo":["viúvo","viúva"],
      "viúva":["viúvo","viúva"],
      separado:["separado","separada"],
      separada:["separado","separada"]
    };
    const pair=map[raw];
    return pair ? (isFemale(s)?pair[1]:pair[0]) : raw;
  }

  function genderizeProfession(s){
    const raw=String(s?.profissao || "").trim();
    const lower=raw.toLowerCase();
    if(lower==="empresário" || lower==="empresaria" || lower==="empresária"){
      return isFemale(s) ? "empresária" : "empresário";
    }
    return raw;
  }

  function socioSingular(s){
    return isFemale(s) ? "sócia" : "sócio";
  }

  function socioAdministradorSingular(s){
    return isFemale(s) ? "sócia administradora" : "sócio administrador";
  }

  function administradorSingular(s){
    return isFemale(s) ? "administradora" : "administrador";
  }

  function pluralSocios(socios){
    if(socios.length && socios.every(isFemale)) return "sócias";
    return "sócios";
  }

  function pluralAdministradores(socios){
    if(socios.length && socios.every(isFemale)) return "administradoras";
    return "administradores";
  }

  function resolucaoConstituicao(socios){
    if(socios.length===1){
      return isFemale(socios[0])
        ? "Única sócia, resolve nesta data, constituir uma sociedade Empresarial do tipo Limitada, mediante as condições estabelecidas nas cláusulas seguintes:"
        : "Único sócio, resolve nesta data, constituir uma sociedade Empresarial do tipo Limitada, mediante as condições estabelecidas nas cláusulas seguintes:";
    }
    if(socios.length && socios.every(isFemale)){
      return "As sócias resolvem nesta data, constituir uma sociedade Empresarial do tipo Limitada, mediante as condições estabelecidas nas cláusulas seguintes:";
    }
    return "Os sócios resolvem nesta data, constituir uma sociedade Empresarial do tipo Limitada, mediante as condições estabelecidas nas cláusulas seguintes:";
  }

  function numeroInteiroPorExtensoSimples(v){
    const text=numeroPorExtensoSimples(v);
    return String(text)
      .replace(/ de reais$/i,"")
      .replace(/ reais$/i,"")
      .replace(/ real$/i,"");
  }

  function currentUserInitial(){
    const user=window.CURRENT_SUPABASE_USER || null;
    const metadata=user?.user_metadata || {};
    const source=String(
      metadata.display_name ||
      metadata.full_name ||
      metadata.name ||
      (user?.email ? user.email.split("@")[0] : "") ||
      "U"
    ).trim();
    const first=source.charAt(0) || "U";
    return first.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
  }

  function updatePrintPaginationStyle(){
    const initial=currentUserInitial().replace(/[^A-Z0-9]/g,"") || "U";
    let style=document.getElementById("osc-print-pagination-style");
    if(!style){
      style=document.createElement("style");
      style.id="osc-print-pagination-style";
      document.head.appendChild(style);
    }
    style.textContent=`
      @media print{
        @page{
          @bottom-right{
            content: counter(page) "/" counter(pages) " ${initial}";
            font-family: Verdana, Geneva, sans-serif;
            font-size: 8pt;
            color: #111;
            vertical-align: top;
          }
        }
      }
    `;
  }
  window.updatePrintPaginationStyle=updatePrintPaginationStyle;

  function naturezaLabel(v){
    const labels = {
      "SOCIEDADE_EMPRESARIA_LIMITADA":"Sociedade Empresária Limitada",
      "SOCIEDADE_LIMITADA_UNIPESSOAL":"Sociedade Limitada Unipessoal"
    };
    return labels[v] || "Sociedade Empresária Limitada";
  }

  function fullCompanyAddress(){ return fullAddressFrom(formData.empresa); }
  function fullAddressFrom(e){
    const logradouro = e.logradouro !== undefined ? e.logradouro : e.endereco;
    const parts=[
      logradouro,
      e.numero ? "nº "+e.numero : "",
      e.complemento,
      e.bairro,
      e.cidade ? e.cidade+"/"+e.uf : e.uf,
      e.cep ? "CEP "+e.cep : ""
    ].filter(Boolean);
    return parts.join(", ");
  }

  function optionList(arr,current){
    return arr.map(x=>`<option value="${x}" ${x===current?"selected":""}>${capitalize(x)}</option>`).join("");
  }
  function ufOptions(current){
    const ufs=["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
    return ufs.map(x=>`<option value="${x}" ${x===current?"selected":""}>${x}</option>`).join("");
  }
  function maskCPF(value){
    const digits = String(value || "").replace(/\D/g,"").slice(0,11);
    if(digits.length <= 3) return digits;
    if(digits.length <= 6) return digits.replace(/(\d{3})(\d+)/,"$1.$2");
    if(digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/,"$1.$2.$3");
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,"$1.$2.$3-$4");
  }

  function formatDate(v){
    const [y,m,d]=v.split("-");
    return `${d}.${m}.${y}`;
  }
  function formatDateSlash(v){
    const [y,m,d]=String(v||"").split("-");
    return y && m && d ? `${d}/${m}/${y}` : "";
  }
  function dataExtenso(v){
    if(!v) return "";
    const dt=new Date(v+"T12:00:00");
    const meses=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    return `${dt.getDate()} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
  }
  function parseCurrency(v){
    if(typeof v === "number") return v;
    let s=String(v||"").trim().replace(/R\$\s?/g,"").replace(/\s/g,"");
    if(!s) return 0;
    if(s.includes(",")){
      s=s.replace(/\./g,"").replace(",",".");
    }
    const n=Number(s.replace(/[^0-9.-]/g,""));
    return Number.isFinite(n)?Math.round(n*100)/100:0;
  }
  function currencyInputValue(v){
    const n=Number(v)||0;
    return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  }
  function currencyEditValue(v){
    const n=Number(v)||0;
    return n? n.toFixed(2).replace(".",",") : "";
  }
  function formatQuotaNumber(v){
    const n=Math.round(Number(v)||0);
    return new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0}).format(n);
  }

  function money(v){
    return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v)||0);
  }
  function formatNumber(v){
    return new Intl.NumberFormat("pt-BR",{maximumFractionDigits:2}).format(Number(v)||0);
  }
  function esc(v){
    return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }
  function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}
  function slug(s){
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
  }

  // Conversão simples apenas para visualização do protótipo.
  function numeroPorExtensoSimples(v){
    v=Math.round(Number(v)||0);
    const especiais={
      0:"zero reais",1:"um real",10:"dez reais",100:"cem reais",1000:"mil reais",
      10000:"dez mil reais",50000:"cinquenta mil reais",100000:"cem mil reais",
      500000:"quinhentos mil reais",1000000:"um milhão de reais"
    };
    return especiais[v] || `${formatNumber(v)} reais`;
  }


  // ================================================================
  // FUNCIONALIDADE: ALTERAÇÃO CONTRATUAL
  // ================================================================

  const constitutionContractHtmlOriginal = contractHtml;
  const constitutionNormalizeDataOriginal = normalizeData;
  let contractMode = "CONSTITUICAO";
  let alterationMultiOpen = false;

  const alterSteps = ["Empresa atual","Sócios atuais","Alterações","Consolidação","Revisão"];

  function emptySocio(){
    return {
      nome:"",
      sexo:"MASCULINO",
      nacionalidade:"brasileiro",
      estadoCivil:"solteiro",
      regimeCasamento:"",
      dataNascimento:"",
      naturalidade:"",
      profissao:"empresário",
      rg:"",
      orgaoEmissor:"SSP",
      ufRg:"SP",
      cpf:"",
      endereco:emptyAddress(),
      capital:0,
      administrador:true
    };
  }

  function blankAlteracaoData(){
    return {
      tipoDocumento:"ALTERACAO",
      empresa:{
        naturezaJuridica:"SOCIEDADE_LIMITADA_UNIPESSOAL",
        porte:"ME",
        razaoSocial:"",
        cnpj:"",
        nire:"",
        numeroAlteracao:"1",
        dataContrato:new Date().toISOString().slice(0,10),
        dataInicioAtividades:"",
        endereco:emptyAddress(),
        capital:{total:0,valorQuota:1},
        objeto:""
      },
      sociosAtuais:[emptySocio()],
      alteracoes:{
        tipos:[],
        enderecoNovo:emptyAddress(),
        objetoNovo:"",
        capitalNovo:{total:0,valorQuota:1},
        sociosFinais:[]
      },
      administracao:{
        forma:"isoladamente"
      }
    };
  }

  function closeContractTypeModal(){
    document.getElementById("contractTypeModal").classList.add("hidden");
  }

  function startNewContract(){
    document.getElementById("contractTypeModal").classList.remove("hidden");
  }

  function startContractType(type){
    closeContractTypeModal();
    editingId = null;
    currentStep = 0;
    if(type==="ALTERACAO"){
      contractMode="ALTERACAO";
      formData=blankAlteracaoData();
    }else{
      contractMode="CONSTITUICAO";
      formData=blankData();
      formData.tipoDocumento="CONSTITUICAO";
    }
    showView("generator");
    renderStep();
  }

  function renderSteps(){
    const list = contractMode==="ALTERACAO" ? alterSteps : steps;
    const bar=document.getElementById("stepsBar");
    bar.style.gridTemplateColumns=`repeat(${Math.min(list.length,6)},1fr)`;
    bar.innerHTML=list.map((s,i)=>{
      let cls="step";
      if(i===currentStep) cls+=" active";
      if(i<currentStep) cls+=" done";
      return `<div class="${cls}">${i+1}. ${s}</div>`;
    }).join("");
  }

  function renderStep(){
    renderSteps();
    const c=document.getElementById("stepContent");
    const title=document.querySelector("#generatorView .card-head h2");
    const subtitle=document.querySelector("#generatorView .card-head .muted");
    if(contractMode==="ALTERACAO"){
      if(title) title.textContent="Nova alteração contratual";
      if(subtitle) subtitle.textContent="Alteração contratual seguida de consolidação";
      if(currentStep===0) c.innerHTML=alterEmpresaStep();
      if(currentStep===1) c.innerHTML=alterSociosAtuaisStep();
      if(currentStep===2) c.innerHTML=alterTiposStep();
      if(currentStep===3) c.innerHTML=alterConsolidacaoStep();
      if(currentStep===4) c.innerHTML=alterRevisaoStep();
      return;
    }
    if(title) title.textContent="Novo contrato social";
    if(subtitle) subtitle.textContent="Constituição de Sociedade Limitada";
    if(currentStep===0) c.innerHTML = empresaStep();
    if(currentStep===1) c.innerHTML = sociosStep();
    if(currentStep===2) c.innerHTML = capitalStep();
    if(currentStep===3) c.innerHTML = objetoStep();
    if(currentStep===4) c.innerHTML = administracaoStep();
    if(currentStep===5) c.innerHTML = revisaoStep();
  }

  function nextStep(){
    const max=(contractMode==="ALTERACAO"?alterSteps.length:steps.length)-1;
    if(currentStep<max){currentStep++;renderStep();window.scrollTo({top:70,behavior:"smooth"})}
  }

  function alterEmpresaStep(){
    const e=formData.empresa;
    const a=e.endereco;
    return `
      <div class="form-grid">
        <div class="field full">
          <label>Natureza jurídica</label>
          <select onchange="formData.empresa.naturezaJuridica=this.value">
            <option value="SOCIEDADE_EMPRESARIA_LIMITADA" ${e.naturezaJuridica==="SOCIEDADE_EMPRESARIA_LIMITADA"?"selected":""}>Sociedade Empresária Limitada</option>
            <option value="SOCIEDADE_LIMITADA_UNIPESSOAL" ${e.naturezaJuridica==="SOCIEDADE_LIMITADA_UNIPESSOAL"?"selected":""}>Sociedade Limitada Unipessoal</option>
          </select>
        </div>
        <div class="field third">
          <label>Porte da empresa</label>
          <select onchange="formData.empresa.porte=this.value">
            <option value="ME" ${e.porte==="ME"?"selected":""}>ME - Microempresa</option>
            <option value="EPP" ${e.porte==="EPP"?"selected":""}>EPP - Empresa de Pequeno Porte</option>
          </select>
        </div>
        <div class="field full">
          <label>Razão social atual</label>
          <input value="${esc(e.razaoSocial)}" oninput="formData.empresa.razaoSocial=this.value" placeholder="Ex.: EMPRESA EXEMPLO LTDA">
        </div>
        <div class="field third">
          <label>CNPJ</label>
          <input inputmode="numeric" maxlength="18" value="${esc(e.cnpj)}"
                 oninput="this.value=maskCNPJ(this.value);formData.empresa.cnpj=this.value"
                 placeholder="00.000.000/0000-00">
        </div>
        <div class="field third">
          <label>NIRE</label>
          <input inputmode="numeric" maxlength="11" value="${esc(e.nire)}"
                 oninput="this.value=this.value.replace(/\D/g,'').slice(0,11);formData.empresa.nire=this.value">
        </div>
        <div class="field third">
          <label>Número da alteração</label>
          <input inputmode="numeric" value="${esc(e.numeroAlteracao)}"
                 oninput="this.value=this.value.replace(/\D/g,'').slice(0,3);formData.empresa.numeroAlteracao=this.value"
                 placeholder="Ex.: 4">
        </div>
        <div class="field third">
          <label>Data do instrumento</label>
          <input type="date" value="${e.dataContrato}" oninput="formData.empresa.dataContrato=this.value">
        </div>
        <div class="field third">
          <label>Início das atividades</label>
          <input type="date" value="${e.dataInicioAtividades}" oninput="formData.empresa.dataInicioAtividades=this.value">
        </div>
      </div>

      <div class="section-title">Endereço atual da sede</div>
      ${addressFieldsHtml("formData.empresa.endereco",a)}

      <div class="section-title">Capital social atual</div>
      <div class="form-grid">
        <div class="field">
          <label>Capital social atual (R$)</label>
          <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(e.capital.total)}"
                 onfocus="this.value=currencyEditValue(formData.empresa.capital.total)"
                 onblur="formData.empresa.capital.total=parseCurrency(this.value);this.value=currencyInputValue(formData.empresa.capital.total)">
        </div>
        <div class="field">
          <label>Valor da quota (R$)</label>
          <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(e.capital.valorQuota || 1)}"
                 onfocus="this.value=currencyEditValue(formData.empresa.capital.valorQuota || 1)"
                 onblur="formData.empresa.capital.valorQuota=parseCurrency(this.value)||1;this.value=currencyInputValue(formData.empresa.capital.valorQuota)">
        </div>
        <div class="field">
          <label>Quantidade atual de quotas</label>
          <input class="number-input" type="text" value="${formatQuotaNumber((Number(e.capital.total)||0)/(Number(e.capital.valorQuota)||1))}" disabled>
        </div>
      </div>

      <div class="section-title">Objeto social atual</div>
      <div class="field full">
        <label>Objeto social vigente</label>
        <textarea oninput="formData.empresa.objeto=this.value">${esc(e.objeto)}</textarea>
      </div>
      ${navButtons(false,true)}
    `;
  }

  function addressFieldsHtml(path,a){
    return `
      <div class="form-grid">
        <div class="field full">
          <label>Logradouro</label>
          <input data-address-path="${path}" data-address-field="logradouro"
                 value="${esc(a.logradouro)}" oninput="${path}.logradouro=this.value">
        </div>
        <div class="field quarter">
          <label>Número</label>
          <input value="${esc(a.numero)}" oninput="${path}.numero=this.value">
        </div>
        <div class="field">
          <label>Complemento</label>
          <input value="${esc(a.complemento)}" oninput="${path}.complemento=this.value">
        </div>
        <div class="field quarter">
          <label>CEP</label>
          <input inputmode="numeric" maxlength="9" value="${esc(a.cep)}"
                 oninput="this.value=maskCEP(this.value);${path}.cep=this.value;maybeLookupCEPStructured('${path}',this)"
                 onblur="maybeLookupCEPStructured('${path}',this)"
                 placeholder="00000-000">
          <div class="cep-feedback" data-cep-feedback-path="${path}"></div>
        </div>
        <div class="field third">
          <label>Bairro</label>
          <input data-address-path="${path}" data-address-field="bairro"
                 value="${esc(a.bairro)}" oninput="${path}.bairro=this.value">
        </div>
        <div class="field third">
          <label>Cidade</label>
          <input data-address-path="${path}" data-address-field="cidade"
                 value="${esc(a.cidade)}" oninput="${path}.cidade=this.value">
        </div>
        <div class="field third">
          <label>UF</label>
          <select data-address-path="${path}" data-address-field="uf"
                  onchange="${path}.uf=this.value">${ufOptions(a.uf)}</select>
        </div>
      </div>`;
  }

  function alterSociosAtuaisStep(){
    return `
      <div class="notice info" style="margin-bottom:14px">
        Cadastre o quadro societário vigente antes da alteração. Esses dados compõem a qualificação inicial do instrumento.
      </div>
      ${formData.sociosAtuais.map((s,i)=>alterSocioCard("sociosAtuais",s,i,true)).join("")}
      <button class="btn btn-secondary" onclick="addAlterSocioAtual()">+ Adicionar sócio atual</button>
      ${navButtons(true,true)}
    `;
  }

  function alterSocioCard(collection,s,i,allowRemove){
    const end=getSocioEndereco(s);
    const base=`formData.${collection}[${i}]`;
    const collectionArray = collection === "alteracoes.sociosFinais" ? formData.alteracoes.sociosFinais : formData.sociosAtuais;
    return `
      <div class="socio-card">
        <div class="head">
          <strong>Sócio ${i+1}</strong>
          ${(allowRemove && collectionArray.length>1)?`<button class="btn btn-danger small" onclick="removeAlterSocio('${collection}',${i})">Remover</button>`:""}
        </div>
        <div class="body">
          <div class="form-grid">
            <div class="field full"><label>Nome completo</label><input value="${esc(s.nome)}" oninput="${base}.nome=this.value"></div>
            <div class="field third">
              <label>Sexo</label>
              <select onchange="${base}.sexo=this.value">
                <option value="MASCULINO" ${s.sexo==="MASCULINO"?"selected":""}>Masculino</option>
                <option value="FEMININO" ${s.sexo==="FEMININO"?"selected":""}>Feminino</option>
              </select>
            </div>
            <div class="field third"><label>Nacionalidade</label><input value="${esc(s.nacionalidade)}" oninput="${base}.nacionalidade=this.value"></div>
            <div class="field third">
              <label>Estado civil</label>
              <select onchange="${base}.estadoCivil=this.value;if(this.value!=='casado'){${base}.regimeCasamento='';}renderStep()">
                ${optionList(["solteiro","casado","divorciado","viúvo","separado"],s.estadoCivil)}
              </select>
            </div>
            <div class="field third"><label>Data de nascimento</label><input type="date" value="${s.dataNascimento}" oninput="${base}.dataNascimento=this.value"></div>
            ${s.estadoCivil==="casado"?`
              <div class="field">
                <label>Regime de casamento</label>
                <select onchange="${base}.regimeCasamento=this.value">
                  <option value="">Selecione...</option>
                  ${["Comunhão parcial de bens","Comunhão universal de bens","Separação total de bens"].map(x=>`<option ${s.regimeCasamento===x?"selected":""}>${x}</option>`).join("")}
                </select>
              </div>`:""}
            <div class="field"><label>Naturalidade</label><input value="${esc(s.naturalidade||"")}" oninput="${base}.naturalidade=this.value" placeholder="Ex.: São Paulo"></div>
            <div class="field third"><label>Profissão</label><input value="${esc(s.profissao)}" oninput="${base}.profissao=this.value"></div>
            <div class="field third"><label>RG</label><input value="${esc(s.rg)}" oninput="${base}.rg=this.value"></div>
            <div class="field third">
              <label>Órgão / UF</label>
              <div style="display:grid;grid-template-columns:1fr 90px;gap:8px">
                <input value="${esc(s.orgaoEmissor)}" oninput="${base}.orgaoEmissor=this.value">
                <select onchange="${base}.ufRg=this.value">${ufOptions(s.ufRg)}</select>
              </div>
            </div>
            <div class="field">
              <label>CPF</label>
              <input inputmode="numeric" maxlength="14" value="${esc(s.cpf)}"
                     oninput="this.value=maskCPF(this.value);${base}.cpf=this.value"
                     placeholder="000.000.000-00">
            </div>
            <div class="field">
              <label>Capital/participação atual (R$)</label>
              <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(s.capital)}"
                     onfocus="this.value=currencyEditValue(${base}.capital)"
                     onblur="${base}.capital=parseCurrency(this.value);this.value=currencyInputValue(${base}.capital)">
            </div>
          </div>

          <div class="section-title" style="margin-top:14px">Endereço residencial</div>
          ${addressFieldsHtml(`${base}.endereco`,end)}
        </div>
      </div>`;
  }

  function addAlterSocioAtual(){
    formData.sociosAtuais.push(emptySocio());
    renderStep();
  }

  function removeAlterSocio(collection,i){
    const target = collection === "alteracoes.sociosFinais" ? formData.alteracoes.sociosFinais : formData.sociosAtuais;
    target.splice(i,1);
    renderStep();
  }

  function toggleAlterMulti(){
    alterationMultiOpen=!alterationMultiOpen;
    const menu=document.getElementById("alterMultiMenu");
    if(menu) menu.classList.toggle("hidden",!alterationMultiOpen);
  }

  function alterLabel(v){
    return {
      ENDERECO:"Alteração de endereço",
      SOCIOS:"Alteração de sócios",
      CAPITAL:"Alteração de capital social",
      OBJETO:"Alteração de objeto social"
    }[v]||v;
  }

  function toggleAlterType(type,checked){
    const arr=formData.alteracoes.tipos;
    if(checked && !arr.includes(type)) arr.push(type);
    if(!checked) formData.alteracoes.tipos=arr.filter(x=>x!==type);

    const needsFinal = formData.alteracoes.tipos.includes("SOCIOS") || formData.alteracoes.tipos.includes("CAPITAL");
    if(needsFinal && formData.alteracoes.sociosFinais.length===0){
      syncSociosFinais();
    }
    if(!needsFinal){
      formData.alteracoes.sociosFinais=[];
    }
    renderStep();
  }

  function syncSociosFinais(){
    formData.alteracoes.sociosFinais = JSON.parse(JSON.stringify(formData.sociosAtuais));
  }

  function alterTiposStep(){
    if((formData.alteracoes.tipos.includes("SOCIOS") || formData.alteracoes.tipos.includes("CAPITAL")) && formData.alteracoes.sociosFinais.length===0) syncSociosFinais();
    const tipos=formData.alteracoes.tipos;
    const selected=tipos.length?tipos.map(alterLabel).join(", "):"Selecione uma ou mais alterações";
    const novoEnd=formData.alteracoes.enderecoNovo;
    const finalSocios=formData.alteracoes.sociosFinais;
    return `
      <div class="field full">
        <label>Tipo de alteração</label>
        <div class="multi-select">
          <button type="button" onclick="toggleAlterMulti()">
            <span>${esc(selected)}</span><strong>⌄</strong>
          </button>
          <div id="alterMultiMenu" class="multi-menu ${alterationMultiOpen?"":"hidden"}">
            ${["ENDERECO","SOCIOS","CAPITAL","OBJETO"].map(t=>`
              <label class="multi-option">
                <input type="checkbox" ${tipos.includes(t)?"checked":""}
                       onchange="toggleAlterType('${t}',this.checked)">
                <span>${alterLabel(t)}</span>
              </label>`).join("")}
          </div>
        </div>
        <div style="margin-top:7px">${tipos.map(t=>`<span class="alter-tag">${alterLabel(t)}</span>`).join("")}</div>
      </div>

      ${tipos.includes("ENDERECO")?`
        <div class="section-title">Alteração de endereço — novo endereço</div>
        ${addressFieldsHtml("formData.alteracoes.enderecoNovo",novoEnd)}
      `:""}

      ${tipos.includes("SOCIOS")?`
        <div class="section-title">Alteração de sócios — quadro societário após a alteração</div>
        <div class="notice info" style="margin-bottom:12px">Edite, remova ou inclua os sócios para representar exatamente o quadro societário que deverá constar após a alteração.</div>
        ${finalSocios.map((s,i)=>alterSocioCard("alteracoes.sociosFinais",s,i,true)).join("")}
        <button class="btn btn-secondary" onclick="addSocioFinal()">+ Adicionar sócio após alteração</button>
      `:""}

      ${tipos.includes("CAPITAL")?`
        <div class="section-title">Alteração de capital social</div>
        <div class="form-grid">
          <div class="field">
            <label>Novo capital social (R$)</label>
            <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(formData.alteracoes.capitalNovo.total)}"
                   onfocus="this.value=currencyEditValue(formData.alteracoes.capitalNovo.total)"
                   onblur="formData.alteracoes.capitalNovo.total=parseCurrency(this.value);this.value=currencyInputValue(formData.alteracoes.capitalNovo.total);renderStep()">
          </div>
          <div class="field">
            <label>Valor da quota (R$)</label>
            <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(formData.alteracoes.capitalNovo.valorQuota||1)}"
                   onfocus="this.value=currencyEditValue(formData.alteracoes.capitalNovo.valorQuota||1)"
                   onblur="formData.alteracoes.capitalNovo.valorQuota=parseCurrency(this.value)||1;this.value=currencyInputValue(formData.alteracoes.capitalNovo.valorQuota);renderStep()">
          </div>
          <div class="field">
            <label>Quantidade de quotas após alteração</label>
            <input class="number-input" type="text" value="${formatQuotaNumber((Number(formData.alteracoes.capitalNovo.total)||0)/(Number(formData.alteracoes.capitalNovo.valorQuota)||1))}" disabled>
          </div>
        </div>
        <div class="section-title" style="margin-top:14px">Distribuição do novo capital</div>
        ${finalSocios.map((s,i)=>`
          <div class="form-grid" style="margin-bottom:10px">
            <div class="field"><label>${esc(s.nome||("Sócio "+(i+1)))}</label><input value="${esc(s.nome)}" disabled></div>
            <div class="field"><label>Capital após alteração (R$)</label>
              <input class="currency-input" type="text" inputmode="decimal" value="${currencyInputValue(s.capital)}"
                     onfocus="this.value=currencyEditValue(formData.alteracoes.sociosFinais[${i}].capital)"
                     onblur="formData.alteracoes.sociosFinais[${i}].capital=parseCurrency(this.value);this.value=currencyInputValue(formData.alteracoes.sociosFinais[${i}].capital)">
            </div>
          </div>`).join("")}
      `:""}

      ${tipos.includes("OBJETO")?`
        <div class="section-title">Alteração de objeto social</div>
        <div class="field full">
          <label>Novo objeto social</label>
          <textarea oninput="formData.alteracoes.objetoNovo=this.value">${esc(formData.alteracoes.objetoNovo)}</textarea>
        </div>
      `:""}

      <div class="model-note">
        O modelo anexado contém a redação específica de alteração de endereço e a estrutura completa de consolidação.
        Para alteração de sócios, capital e objeto, este protótipo gera cláusulas parametrizadas dentro da mesma estrutura visual; a redação definitiva dessas três cláusulas deve ser validada com os modelos específicos do escritório antes da produção.
      </div>
      ${navButtons(true,true,tipos.length===0)}
    `;
  }

  function addSocioFinal(){
    formData.alteracoes.sociosFinais.push(emptySocio());
    renderStep();
  }

  function finalAddress(d){
    return d.alteracoes.tipos.includes("ENDERECO") ? d.alteracoes.enderecoNovo : d.empresa.endereco;
  }

  function finalObject(d){
    return d.alteracoes.tipos.includes("OBJETO") ? d.alteracoes.objetoNovo : d.empresa.objeto;
  }

  function finalCapital(d){
    return d.alteracoes.tipos.includes("CAPITAL") ? d.alteracoes.capitalNovo : d.empresa.capital;
  }

  function usesFinalSocios(d){
    return d.alteracoes.tipos.includes("SOCIOS") || d.alteracoes.tipos.includes("CAPITAL");
  }

  function finalSocios(d){
    if(!usesFinalSocios(d)) return d.sociosAtuais;
    if(!d.alteracoes.sociosFinais || d.alteracoes.sociosFinais.length===0) return d.sociosAtuais;
    return d.alteracoes.sociosFinais;
  }

  function alterConsolidacaoStep(){
    const socios=finalSocios(formData);
    const adminCollection = usesFinalSocios(formData) ? "alteracoes.sociosFinais" : "sociosAtuais";
    return `
      <div class="notice info" style="margin-bottom:14px">
        A consolidação utiliza automaticamente a situação final resultante das alterações selecionadas.
      </div>
      <div class="summary">
        <div class="summary-box"><h4>Endereço consolidado</h4><p>${esc(fullAddressFrom(finalAddress(formData)))}</p></div>
        <div class="summary-box"><h4>Capital consolidado</h4><p><strong>${money(Number(finalCapital(formData).total)||0)}</strong></p></div>
        <div class="summary-box" style="grid-column:1/-1"><h4>Objeto consolidado</h4><p>${esc(finalObject(formData)||"Não informado")}</p></div>
      </div>

      <div class="section-title">Administração na consolidação</div>
      ${socios.map((s,i)=>`
        <label style="display:flex;align-items:center;gap:10px;border:1px solid var(--line);padding:12px;border-radius:10px;background:#fff;margin-bottom:8px">
          <input type="checkbox" style="width:auto" ${s.administrador?"checked":""}
                 onchange="formData.${adminCollection}[${i}].administrador=this.checked">
          <span>${esc(s.nome||("Sócio "+(i+1)))}</span>
        </label>`).join("")}
      <div class="field" style="margin-top:14px">
        <label>Forma de administração</label>
        <select onchange="formData.administracao.forma=this.value">
          <option value="isoladamente" ${formData.administracao.forma==="isoladamente"?"selected":""}>Isoladamente</option>
          <option value="em conjunto" ${formData.administracao.forma==="em conjunto"?"selected":""}>Em conjunto</option>
        </select>
      </div>
      ${navButtons(true,true)}
    `;
  }

  function validateAlteracao(){
    const issues=[];
    const d=formData,e=d.empresa;
    if(!e.razaoSocial.trim()) issues.push("Informe a razão social.");
    if(!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(e.cnpj||"")) issues.push("Informe o CNPJ no formato 00.000.000/0000-00.");
    if(!e.nire.trim()) issues.push("Informe o NIRE.");
    if(!e.numeroAlteracao.trim()) issues.push("Informe o número da alteração.");
    if(!e.endereco.logradouro.trim() || !e.endereco.cidade.trim()) issues.push("Informe o endereço atual da sede.");
    if(e.endereco.cep && !/^\d{5}-\d{3}$/.test(e.endereco.cep)) issues.push("CEP atual da empresa inválido.");
    if((Number(e.capital.total)||0)<=0) issues.push("Informe o capital social atual.");
    if(!e.objeto.trim()) issues.push("Informe o objeto social atual.");
    if(d.alteracoes.tipos.length===0) issues.push("Selecione ao menos um tipo de alteração.");
    d.sociosAtuais.forEach((s,i)=>{
      if(!s.nome.trim()) issues.push(`Informe o nome do sócio atual ${i+1}.`);
      if(!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s.cpf||"")) issues.push(`CPF do sócio atual ${i+1} inválido.`);
      if(s.estadoCivil==="casado" && !s.regimeCasamento) issues.push(`Informe o regime de casamento do sócio atual ${i+1}.`);
    });
    if(d.alteracoes.tipos.includes("ENDERECO")){
      const a=d.alteracoes.enderecoNovo;
      if(!a.logradouro.trim() || !a.cidade.trim()) issues.push("Informe o novo endereço.");
      if(a.cep && !/^\d{5}-\d{3}$/.test(a.cep)) issues.push("CEP do novo endereço inválido.");
    }
    if(d.alteracoes.tipos.includes("OBJETO") && !d.alteracoes.objetoNovo.trim()) issues.push("Informe o novo objeto social.");
    const socios=finalSocios(d);
    if(d.alteracoes.tipos.includes("SOCIOS") && socios.length===0) issues.push("Informe o quadro societário após a alteração.");
    socios.forEach((s,i)=>{
      if(!s.nome.trim()) issues.push(`Informe o nome do sócio consolidado ${i+1}.`);
    });
    const cap=finalCapital(d);
    const dist=socios.reduce((a,s)=>a+(Number(s.capital)||0),0);
    if((Number(cap.total)||0)<=0) issues.push("Capital consolidado inválido.");
    if(Math.abs((Number(cap.total)||0)-dist)>0.01) issues.push("A distribuição do capital consolidado não confere com o capital social.");
    const quotaValue=Number(cap.valorQuota)||1;
    const totalQuotas=(Number(cap.total)||0)/quotaValue;
    if(!Number.isInteger(Math.round(totalQuotas)) || Math.abs(totalQuotas-Math.round(totalQuotas))>0.000001) issues.push("A quantidade total de quotas deve resultar em número inteiro.");
    if(!socios.some(s=>s.administrador)) issues.push("Selecione ao menos um administrador para a consolidação.");
    return issues;
  }

  function alterRevisaoStep(){
    const d=formData,issues=validateAlteracao();
    const tipos=d.alteracoes.tipos;
    const socios=finalSocios(d);
    return `
      <div class="summary">
        <div class="summary-box"><h4>Empresa</h4><p><strong>${esc(d.empresa.razaoSocial||"Não informado")}</strong></p><p>CNPJ ${esc(d.empresa.cnpj)} · NIRE ${esc(d.empresa.nire)}</p></div>
        <div class="summary-box"><h4>Instrumento</h4><p><strong>${esc(d.empresa.numeroAlteracao)}ª Alteração contratual</strong></p><p>${tipos.map(alterLabel).map(esc).join("<br>")}</p></div>
        <div class="summary-box"><h4>Capital consolidado</h4><p><strong>${money(Number(finalCapital(d).total)||0)}</strong></p></div>
        <div class="summary-box"><h4>Quadro consolidado</h4>${socios.map(s=>`<p>${esc(s.nome)} — ${money(Number(s.capital)||0)}</p>`).join("")}</div>
        <div class="summary-box" style="grid-column:1/-1"><h4>Endereço consolidado</h4><p>${esc(fullAddressFrom(finalAddress(d)))}</p></div>
      </div>
      <div style="margin-top:14px" class="notice ${issues.length?"error":"success"}">
        ${issues.length?`<strong>Revise antes de gerar:</strong><br>${issues.map(x=>"• "+esc(x)).join("<br>")}`:"✓ Dados mínimos conferidos para a alteração e consolidação."}
      </div>
      <div class="nav-row">
        <button class="btn btn-secondary" onclick="prevStep()">Voltar</button>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" onclick="previewContract()">Visualizar contrato</button>
          <button class="btn btn-primary" onclick="generateAndSave()" ${issues.length?"disabled style='opacity:.5;cursor:not-allowed'":""}>Gerar contrato</button>
        </div>
      </div>
    `;
  }

  function maskCNPJ(value){
    const d=String(value||"").replace(/\D/g,"").slice(0,14);
    if(d.length<=2) return d;
    if(d.length<=5) return d.replace(/(\d{2})(\d+)/,"$1.$2");
    if(d.length<=8) return d.replace(/(\d{2})(\d{3})(\d+)/,"$1.$2.$3");
    if(d.length<=12) return d.replace(/(\d{2})(\d{3})(\d{3})(\d+)/,"$1.$2.$3/$4");
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/,"$1.$2.$3/$4-$5");
  }

  function ordinalClause(n){
    return ["PRIMEIRA","SEGUNDA","TERCEIRA","QUARTA","QUINTA","SEXTA","SÉTIMA","OITAVA"][n-1]||String(n);
  }

  function qualificationAlter(s){
    const nasc=s.dataNascimento?formatDateSlash(s.dataNascimento):"";
    const regime=s.estadoCivil==="casado" && s.regimeCasamento ? `, ${String(s.regimeCasamento).toLowerCase()}` : "";
    const natural=s.naturalidade?`, natural de ${esc(s.naturalidade)}`:"";
    return `<strong>${esc(s.nome)}</strong>, ${esc(genderizeNationality(s))}, ${esc(genderizeCivilState(s))}${esc(regime)}, ${esc(genderizeProfession(s))}, ${genderWord(s,"nascido","nascida")} em ${nasc}${natural}, ${genderWord(s,"portador","portadora")} da cédula de identidade sob o nº ${esc(s.rg)} ${esc(s.orgaoEmissor)}/${esc(s.ufRg)}, e do CPF sob o nº ${esc(s.cpf)}, residente e ${genderWord(s,"domiciliado","domiciliada")} ${esc(fullSocioAddress(s))}.`;
  }

  function naturePhrase(nat,sociosCount){
    if(nat==="SOCIEDADE_LIMITADA_UNIPESSOAL") return "Sociedade Limitada Unipessoal";
    return "Sociedade Empresária Limitada";
  }

  function alterationClausesHtml(d){
    const parts=[];
    let n=1;
    const tipos=d.alteracoes.tipos;
    if(tipos.includes("ENDERECO")){
      parts.push(`<div class="clause-title">CLÁUSULA ${ordinalClause(n++)} – DA ALTERAÇÃO DE ENDEREÇO</div>
      <p>A empresa individual de responsabilidade limitada passar a exercer suas atividades ${esc(fullAddressFrom(d.alteracoes.enderecoNovo))}.</p>`);
    }
    if(tipos.includes("SOCIOS")){
      const rows=finalSocios(d).map(s=>`<li>${qualificationAlter(s)}</li>`).join("");
      parts.push(`<div class="clause-title">CLÁUSULA ${ordinalClause(n++)} – DA ALTERAÇÃO DE SÓCIOS</div>
      <p>O quadro societário passa a ser composto pelos seguintes sócios:</p><ul>${rows}</ul>`);
    }
    if(tipos.includes("CAPITAL")){
      const c=d.alteracoes.capitalNovo;
      parts.push(`<div class="clause-title">CLÁUSULA ${ordinalClause(n++)} – DA ALTERAÇÃO DO CAPITAL SOCIAL</div>
      <p>O capital social passa a ser de <strong>${money(Number(c.total)||0)}</strong> (${esc(numeroPorExtensoSimples(Number(c.total)||0))}), dividido em <strong>${formatQuotaNumber((Number(c.total)||0)/(Number(c.valorQuota)||1))}</strong> quotas de ${money(Number(c.valorQuota)||1)} cada uma.</p>`);
    }
    if(tipos.includes("OBJETO")){
      parts.push(`<div class="clause-title">CLÁUSULA ${ordinalClause(n++)} – DA ALTERAÇÃO DO OBJETO SOCIAL</div>
      <p>A sociedade passa a ter como objeto social ${esc(d.alteracoes.objetoNovo)}.</p>`);
    }
    return parts.join("");
  }

  function consolidatedQuotaTable(d){
    const socios=finalSocios(d),cap=finalCapital(d);
    const total=Number(cap.total)||0,vq=Number(cap.valorQuota)||1;
    const rows=socios.map(s=>{
      const val=Number(s.capital)||0;
      const q=vq?val/vq:0,p=total?val/total*100:0;
      return `<tr><td>${esc(s.nome)}</td><td class="num">${formatQuotaNumber(q)}</td><td class="num">${p.toFixed(2)}%</td><td class="num">${money(val)}</td></tr>`;
    }).join("");
    return `<table class="quota-table"><thead><tr><th>SÓCIO</th><th>QUOTAS</th><th>%</th><th>VALOR</th></tr></thead>
    <tbody>${rows}<tr class="total-row"><td>TOTAL</td><td class="num">${formatQuotaNumber(total/vq)}</td><td class="num">100,00%</td><td class="num">${money(total)}</td></tr></tbody></table>`;
  }

  function alterationContractHtml(d){
    const e=d.empresa;
    const atuais=d.sociosAtuais;
    const socios=finalSocios(d);
    const cap=finalCapital(d);
    const endereco=finalAddress(d);
    const objeto=finalObject(d);
    const admins=socios.filter(s=>s.administrador);
    const natureza=naturePhrase(e.naturezaJuridica,socios.length);
    const adminNames=admins.map(s=>s.nome).join(", ");
    const inicio=e.dataInicioAtividades?dataExtenso(e.dataInicioAtividades):"";
    return `
      <div class="contract-page">
        <div class="logos">
          <img class="logo-img souza" src="data:image/png;base64,${document.querySelector('.system-logos .souza').src.split(',')[1]}" alt="Souza Cardoso">
          <img class="logo-img paulistana" src="data:image/png;base64,${document.querySelector('.system-logos .paulistana').src.split(',')[1]}" alt="Paulistana">
        </div>

        <div class="alteration-cover-block">
          <div class="company">${esc(e.razaoSocial)}</div>
          <div class="ids"><span>CNPJ ${esc(e.cnpj)}</span><span>#</span><span>NIRE ${esc(e.nire)}</span></div>
        </div>

        <div class="alteration-instrument">Instrumento de ${esc(e.numeroAlteracao)}º Alteração contratual de Sociedade Empresária do tipo Limitada.</div>

        ${atuais.map(s=>`<p>${qualificationAlter(s)}</p>`).join("")}

        <p>${atuais.length===1?"O único sócio":"Os sócios"} da empresa sob a denominação <strong>${esc(e.razaoSocial)}</strong>, com o seu instrumento de constituição registrado na JUCESP, sob o n.º <strong>${esc(e.nire)}</strong>, com sede ${esc(fullAddressFrom(e.endereco))}, inscrita no CNPJ/MF sob o <strong>${esc(e.cnpj)}</strong>. Têm entre si, justo e contratado, alteração do contrato social, bem como sua consolidação mediante as condições estabelecidas nas cláusulas seguintes:</p>

        ${alterationClausesHtml(d)}

        <p class="consolidation-break">Devido às alterações acima, os sócios resolvem CONSOLIDAR o contrato social conforme cláusulas e condições a seguir:</p>

        ${socios.map(s=>`<p>${qualificationAlter(s)}</p>`).join("")}
        <p>${socios.length===1?"A única sócia":"Os sócios"} da empresa sob a denominação <strong>${esc(e.razaoSocial)}</strong>, com o seu instrumento de constituição registrado na JUCESP, sob o n.º <strong>${esc(e.nire)}</strong>, com sede ${esc(fullAddressFrom(endereco))}, inscrita no CNPJ/MF sob o <strong>${esc(e.cnpj)}</strong>.</p>

        <div class="clause-title">CLÁUSULA PRIMEIRA – CAPITAL SOCIAL</div>
        <p>O capital social é de <strong>${money(Number(cap.total)||0)}</strong> (${esc(numeroPorExtensoSimples(Number(cap.total)||0))}), divididos em ${formatQuotaNumber((Number(cap.total)||0)/(Number(cap.valorQuota)||1))} quotas, no valor de ${money(Number(cap.valorQuota)||1)} cada quota, totalmente integralizadas neste ato, em moeda corrente do país e assim distribuídas:</p>
        ${consolidatedQuotaTable(d)}

        <div class="clause-title">CLÁUSULA SEGUNDA – DO OBJETO SOCIAL</div>
        <p>A ${natureza} tem como objeto social ${esc(objeto)}.</p>

        <div class="clause-title">CLÁUSULA TERCEIRA - DA RESPONSABILIDADE DO SÓCIO</div>
        <p>A responsabilidade do sócio é restrita ao valor de suas quotas, eles respondem solidariamente pela integralização do capital social.</p>

        <div class="clause-title">CLÁUSULA QUARTA - DA CESSÃO E/OU TRANSFERÊNCIA DE QUOTAS</div>
        <p>As quotas são indivisíveis e poderão ser cedidas ou transferidas a terceiros, diante de alteração contratual pertinente.</p>

        <div class="clause-title">CLÁUSULA QUINTA - DO PERÍODO DAS ATIVIDADES</div>
        <p>A sociedade iniciou suas atividades ${inicio?`em <strong>${esc(inicio)}</strong>`:""} seu prazo de duração é por tempo indeterminado.</p>

        <div class="clause-title">CLÁUSULA SEXTA - DA ADMINISTRAÇÃO</div>
        <p>A administração da ${natureza} caberá ${admins.length===1?"ao Sócio Administrador":"aos Sócios Administradores"} <strong>${esc(adminNames)}</strong>, com poderes e atribuições de representá-los ativa, passiva, judicial e extrajudicialmente, sempre na defesa dos interesses sociais, sendo de única e exclusiva competência os negócios patrimoniais, trabalhistas, previdenciários, tributários, financeiros, comerciais e todos os demais atos necessários à gestão da sociedade, respondendo quando for o caso, pelos excessos que vier a cometer, autorizado o uso do nome empresarial, vedado, no entanto, em atividades estranhas ao interesse social ou assumir obrigações seja em favor de qualquer dos quotistas ou de terceiros. Todavia, podendo onerar ou alienar bens imóveis da sociedade, sem autorização dos sócios.</p>

        <div class="clause-title">CLÁUSULA SÉTIMA - DO EXERCÍCIO SOCIAL</div>
        <p>Ao término de cada exercício social, em 31 de dezembro, o administrador prestará contas justificadas de sua administração, procedendo à elaboração do inventário, do balanço patrimonial e do balanço de resultado econômico, cabendo ao sócio, na proporção de suas quotas, os lucros ou perdas apuradas.</p>

        <div class="clause-title">CLÁUSULA OITAVA - DA FILIAL</div>
        <p>A ${natureza} poderá a qualquer tempo, abrir ou fechar filial, mediante alteração contratual assinada pelo os sócios.</p>

        <div class="clause-title">CLÁUSULA NONA – DO PRÓ LABORE</div>
        <p>Fica facultado a retirada de pró-labore dos sócios, ficando a critério do titular sobre sua retirada e valores.</p>

        <div class="clause-title">CLÁUSULA DÉCIMA - DO DESIMPEDIMENTO</div>
        <p>${admins.length===1?"O administrador declara":"Os administradores declaram"} sob as penas da Lei, de que não está impedido de exercer a administração da ${natureza}, por lei especial, ou em virtude de condenação criminal, ou por se encontrar sob os efeitos dela, a pena que vede, ainda que temporariamente, o acesso a cargos públicos; ou por crime falimentar, de prevaricação, peita ou suborno, concussão, peculato, ou contra a economia popular, contra o sistema financeiro nacional, contra normas de defesa de concorrência, contra as relações de consumo, fé pública, ou a propriedade.</p>

        <div class="clause-title">CLÁUSULA DÉCIMA PRIMEIRA – DO FALECIMENTO OU INTERDIÇÃO DOS SÓCIOS</div>
        <p>Falecendo ou interditando o sócio, a ${natureza} continuará suas atividades com os herdeiros, sucessores e o incapaz. Não sendo possível ou inexistindo interesse destes, o valor de seus haveres será apurado e liquidado com base na situação patrimonial da sociedade, à data da resolução, verificada em balanço especialmente levantado.</p>
        <p><strong>Parágrafo Único:</strong> O mesmo procedimento será adotado em outros casos em que a sociedade se resolva em relação a seu sócio.</p>

        <div class="clause-title">CLÁUSULA DÉCIMA SEGUNDA - DO FORO</div>
        <p>Fica eleito o foro do município da sede social da empresa, para o exercício e o cumprimento dos direitos e obrigações resultantes deste contrato. E por estarem assim justos e contratados, a qual após lida e achada em conforme, assina o sócio, este contrato em 3(três) vias de igual teor e forma.</p>

        <p style="text-align:right;margin-top:28px">${esc(endereco.cidade||"São Paulo")}/${esc(endereco.uf||"SP")}, ${dataExtenso(e.dataContrato)}.</p>
        ${admins.map(s=>`<div class="signature"><div class="line"></div><strong>${esc(s.nome)}</strong><br><em>${admins.length===1?"Sócio Administrador":"Sócio Administrador"}</em></div>`).join("")}
      </div>`;
  }

  contractHtml = function(d){
    if(d && d.tipoDocumento==="ALTERACAO") return alterationContractHtml(d);
    return constitutionContractHtmlOriginal(d);
  };

  function normalizeAlteracaoData(d){
    const base=blankAlteracaoData();
    d=d||base;
    d.tipoDocumento="ALTERACAO";
    d.empresa={...base.empresa,...(d.empresa||{})};
    d.empresa.endereco={...emptyAddress(),...(d.empresa.endereco||{})};
    d.empresa.capital={...base.empresa.capital,...(d.empresa.capital||{})};
    d.sociosAtuais=(d.sociosAtuais||base.sociosAtuais).map(s=>normalizeAlterSocio(s));
    d.alteracoes={...base.alteracoes,...(d.alteracoes||{})};
    d.alteracoes.enderecoNovo={...emptyAddress(),...(d.alteracoes.enderecoNovo||{})};
    d.alteracoes.capitalNovo={...base.alteracoes.capitalNovo,...(d.alteracoes.capitalNovo||{})};
    d.alteracoes.sociosFinais=(d.alteracoes.sociosFinais||[]).map(s=>normalizeAlterSocio(s));
    d.administracao={...base.administracao,...(d.administracao||{})};
    return d;
  }

  function normalizeAlterSocio(s){
    return {...emptySocio(),...(s||{}),endereco:{...emptyAddress(),...((s&&s.endereco)||{})}};
  }

  normalizeData = function(d){
    if(d && d.tipoDocumento==="ALTERACAO") return normalizeAlteracaoData(d);
    return constitutionNormalizeDataOriginal(d);
  };

  function generateAndSave(){
    if(typeof window.supabaseSaveContract === "function"){
      return window.supabaseSaveContract();
    }
    const issues=contractMode==="ALTERACAO"?validateAlteracao():validateAll();
    if(issues.length){alert("Revise os campos obrigatórios.");return}
    const id=editingId||("ct_"+Date.now());
    const now=new Date().toISOString();
    if(contractMode==="CONSTITUICAO") formData.tipoDocumento="CONSTITUICAO";
    const item={
      id,
      createdAt:editingId?(getHistory().find(x=>x.id===editingId)?.createdAt||now):now,
      updatedAt:now,
      data:JSON.parse(JSON.stringify(formData))
    };
    let hist=getHistory().filter(x=>x.id!==id);
    hist.unshift(item);
    localStorage.setItem("osc_contract_history",JSON.stringify(hist));
    editingId=id;
    previewContract();
  }

  function previewContract(id=null){
    let data;
    if(id){
      const item=getHistory().find(x=>x.id===id);
      if(!item)return;
      data=normalizeData(JSON.parse(JSON.stringify(item.data)));
    }else{
      data=normalizeData(JSON.parse(JSON.stringify(formData)));
    }
    currentGenerated=data;
    document.getElementById("printArea").innerHTML=contractHtml(data);
    document.getElementById("contractModal").classList.remove("hidden");
  }

  function editContract(id){
    const item=getHistory().find(x=>x.id===id);
    if(!item)return;
    formData=normalizeData(JSON.parse(JSON.stringify(item.data)));
    contractMode=formData.tipoDocumento==="ALTERACAO"?"ALTERACAO":"CONSTITUICAO";
    editingId=id;
    currentStep=0;
    showView("generator");
    renderStep();
  }

  function renderHistory(){
    const list=document.getElementById("historyList");
    const q=(document.getElementById("historySearch")?.value||"").toLowerCase();
    const hist=getHistory().filter(x=>(x.data.empresa?.razaoSocial||"").toLowerCase().includes(q));
    if(!hist.length){list.innerHTML=`<div class="empty">Nenhum contrato encontrado.</div>`;return;}
    list.innerHTML=hist.map(x=>{
      const type=x.data.tipoDocumento==="ALTERACAO"?"Alteração":"Constituição";
      const socios=x.data.tipoDocumento==="ALTERACAO"?(x.data.sociosAtuais?.length||0):(x.data.socios?.length||0);
      return `<div class="history-item">
        <div>
          <strong>${esc(x.data.empresa?.razaoSocial||"Sem razão social")}</strong>
          <div class="history-meta">${type} · Gerado em ${new Date(x.createdAt).toLocaleString("pt-BR")} · ${socios} sócio(s)</div>
        </div>
        <div class="history-actions">
          <button class="btn btn-ghost small" onclick="previewContract('${x.id}')">Visualizar</button>
          <button class="btn btn-secondary small" onclick="editContract('${x.id}')">Editar / duplicar</button>
          <button class="btn btn-ghost small" onclick="downloadHistoryWord('${x.id}')">Word</button>
          <button class="btn btn-primary small" onclick="previewContract('${x.id}');setTimeout(()=>printContract(),300)">Imprimir</button>
          <button class="btn btn-danger small" onclick="deleteContract('${x.id}')">Excluir</button>
        </div>
      </div>`;
    }).join("");
  }

  document.getElementById("loginPassword").addEventListener("keydown",e=>{
    if(e.key==="Enter"){ if(window.supabaseLogin) window.supabaseLogin(); else doLogin(); }
  });
  document.getElementById("loginEmail").addEventListener("keydown",e=>{
    if(e.key==="Enter") document.getElementById("loginPassword").focus();
  });

  let _titleBeforePrint = "";
  window.addEventListener("beforeprint",()=>{
    _titleBeforePrint = document.title;
    document.title = "\u200B";
  });
  window.addEventListener("afterprint",()=>{
    document.title = _titleBeforePrint || "Gerador de Contratos Sociais";
  });


  renderHistory();
