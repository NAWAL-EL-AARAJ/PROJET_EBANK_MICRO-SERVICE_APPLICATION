// Toutes les requêtes passent par la gateway (routes automatiques Eureka : /NOM-DU-SERVICE/**)
export const GATEWAY_URL = 'http://localhost:9999';

export const API = {
  customers: `${GATEWAY_URL}/CUSTOMER-SERVICE/customers`,
  accounts: `${GATEWAY_URL}/EBANK-SERVICE/accounts`,
  chat: `${GATEWAY_URL}/EBANK-CHATBOT-SERVICE/chat`,
};
