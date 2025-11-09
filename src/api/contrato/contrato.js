const API_URL = "http://localhost:5000/api/pets";

export async function getPets() {
  const res = await fetch(API_URL);
  return res.json();
}