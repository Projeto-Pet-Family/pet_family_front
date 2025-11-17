const API_URL = "http://localhost:3000/hospedagens";

export async function criarHospedagem(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Erro ao enviar dados para a API");
  }

  return res.json();
}
