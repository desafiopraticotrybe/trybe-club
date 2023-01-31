// src/tests/integration/doubles/members.stub.js

const snakeize = require('snakeize');

const membersList = [
  {
    id: 1,
    first_name: 'Carlos Márcio',
    last_name: 'Russo',
    email: 'cmrusso@email.com',
    phone: '51992824816',
  },
  {
    id: 2,
    first_name: 'Adão',
    last_name: 'Ferreira',
    email: 'adaofer@email.com',
    phone: '21985336211',
  },
  {
    id: 3,
    first_name: 'Jandira',
    last_name: 'Soares',
    email: 'jandiras@email.com',
    phone: '48994325998',
  },
];

const newMember = {
  first_name: 'Glauco',
  last_name: 'Neves',
  email: 'glauconeves@email.com',
  phone: '21998743568',
  plan_id: '3',
};

const updateMember = {
  first_name: 'Jandira',
  last_name: 'da Silva Junqueira Soares',
  email: 'jandirasjs@email.com',
  phone: '48994325999',
  plan_id: '1',
};

// estamos criando este stub pois esperamos que camelize/snakeize sejam utilizados no "meio do caminho"
const updateMemberResponse = snakeize(updateMember);

const adminMock = {
  user: 'admin',
  password: 'xablau',
};

const wrongUserAdminMock = {
  user: 'batatinha123',
  password: 'xablau',
}; 

const wrongPasswordAdminMock = {
  user: 'admin',
  password: 'batatinha123',
}; 

module.exports = { 
  membersList,
  newMember,
  updateMember,
  updateMemberResponse,
  adminMock,
  wrongUserAdminMock,
  wrongPasswordAdminMock,
 };
