// utils/authUtils.js

/**
 * Armazena o idHospedagem no cache
 * @param {string} idHospedagem - ID da hospedagem
 * @param {boolean} rememberMe - Se deve lembrar no localStorage
 */
export const saveIdHospedagem = (idHospedagem, rememberMe = false) => {
  try {
    if (rememberMe) {
      localStorage.setItem('idHospedagem', idHospedagem);
    } else {
      sessionStorage.setItem('idHospedagem', idHospedagem);
    }
    console.log("idHospedagem salvo:", idHospedagem);
    return true;
  } catch (error) {
    console.error("Erro ao salvar idHospedagem:", error);
    return false;
  }
};

/**
 * Obtém o idHospedagem do cache
 * @returns {string|null} ID da hospedagem ou null
 */
export const getIdHospedagem = () => {
  try {
    // Tenta primeiro do localStorage
    const id = localStorage.getItem('idHospedagem') || sessionStorage.getItem('idHospedagem');
    return id;
  } catch (error) {
    console.error("Erro ao obter idHospedagem:", error);
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getIdHospedagem();
};

/**
 * Remove o idHospedagem do cache
 */
export const logout = () => {
  localStorage.removeItem('idHospedagem');
  sessionStorage.removeItem('idHospedagem');
  console.log("idHospedagem removido do cache");
};