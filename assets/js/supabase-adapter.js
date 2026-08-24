try{
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    console.error("Supabase login error:", error);

    const msg = String(error.message || "");

    if(msg.toLowerCase().includes("invalid login credentials")){
      setLoginMessage(
        "E-mail ou senha inválidos no Supabase. Verifique a senha cadastrada para este usuário."
      );
    }else if(msg.toLowerCase().includes("email not confirmed")){
      setLoginMessage(
        "O e-mail deste usuário ainda não foi confirmado no Supabase."
      );
    }else{
      setLoginMessage("Falha no login do Supabase: " + msg);
    }

    return;
  }

  if(!data?.session){
    setLoginMessage(
      "O Supabase não retornou uma sessão válida para este usuário."
    );
    return;
  }

  await loadHistory();
  window.showApp();

}catch(err){
  console.error("Unexpected Supabase login error:", err);

  setLoginMessage(
    "Erro de conexão com o Supabase: " +
    (err?.message || String(err))
  );
}
