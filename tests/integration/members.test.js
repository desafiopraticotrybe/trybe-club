//  tests/integration/members.test.js

// Importamos o Chai para poder utilizar suas asserções nos testes
const chai = require('chai');
// Importamos o plugin Chai HTTP para que possamos simular as interações com nossa API REST;
const chaiHttp = require('chai-http');

const { expect, use } = chai;
// Aqui fazemos a ligação do Chai HTTP com o Chai;
use(chaiHttp);
// Importamos o Sinon que nos permitirá utilizar nossos dublês para simular as interações com o database;
const Sinon = require('sinon');
const app = require('../../src/app');
// Importamos nosso connection para que sua função 'connection.execute' posse ser dublada pelo Sinon;
const connection = require('../../src/database/connection');
const {
  newMember,
  updateMember,
  updateMemberResponse,
  wrongUserAdminMock,
  wrongPasswordAdminMock,
  adminMock,
} = require('./doubles/members.mock');
// Este é nosso dublê da lista de membros;
const { membersList, monthlyRevenue } = require('./doubles/members.stub');

describe('Testando o endpoint GET /members', () => {
  // O hook afterEach irá executar Sinon.restore para restaurar os stubs após cada teste.
  afterEach(Sinon.restore);
  it('Testando a listagem de pessoas membros do TrybeClub', async () => {
    // Fazemos que a chamada do método execute seja dublada pelo membersList quando for chamada dentro deste teste;
    Sinon.stub(connection, 'execute').resolves([membersList]);
    // Utilizamos o chai para simular a requisição a nosso app, o que desencadeia na chamada de connection.execute, que está dublada como memberList
    const response = await chai.request(app).get('/members');
    // Esperamos que a requisição tenha status 200 nesta situação e que a lista de membros seja retornada no corpo da requisição;
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(membersList);
  });
  // Observe que repetimos o mesmo processo, apenas mudando a função dos stubs;
  it('Testando a listagem da pessoa membro do TrybeClub pelo id', async () => {
    Sinon.stub(connection, 'execute').resolves([[membersList[0]]]);

    const response = await chai.request(app).get('/members/1');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(membersList[0]);
  });
});

describe('1 - Testando o endpoint POST /members/admin', () => {
  it('Testando o endpoint do faturamento mensal do TrybeClub com o login de admin', async () => {
    // A query entrega um objeto dentro de um array que também está dentro de um array [[{}]]
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai.request(app).get('/members/admin').send(adminMock);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(monthlyRevenue);
  });
  it('Testando quando o user não for informado', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai
      .request(app)
      .get('/members/admin')
      .send({ password: 'xablau' });

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ message: 'user não informado.' });
  });
  it('Testando quando o user for inválido', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai
      .request(app)
      .get('/members/admin')
      .send(wrongUserAdminMock);

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'user inválido.' });
  });
  it('Testando quando o password não for informado', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai
      .request(app)
      .get('/members/admin')
      .send({ user: 'admin' });

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ message: 'password não informado.' });
  });
  it('Testando quando o password for inválido', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai
      .request(app)
      .get('/members/admin')
      .send(wrongPasswordAdminMock);

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'password inválido.' });
  });
  afterEach(Sinon.restore);
});

describe('Testando o endpoint POST /members', () => {
  it('Testando a criação de um novo membro do TrybeClub', async () => {
    // Estamos utilizando um recurso do Sinon que permite dublar de maneiras diferentes a chamada de uma mesma função, pois precisamos utilizar connection.execute duas vezes neste caso
    Sinon.stub(connection, 'execute')
      .onFirstCall()
      .resolves([{ insertId: 4 }])
      .onSecondCall()
      // este é um retorno que demonstra que houve 1 linha da tabela afetada durante a execução do insert na tabela de 'members_plans'
      .resolves([{ affectedRows: 1 }]);

    const response = await chai.request(app).post('/members').send(newMember);

    expect(response.status).to.equal(201);
    expect(response.body).to.deep.equal({ ...newMember, id: 4 });
  });
  afterEach(Sinon.restore);
});

describe('5 - Testando o endpoint DELETE /members ', () => {
  it('Testando deletar um membro do TrybeClub', async () => {
    Sinon.stub(connection, 'execute')
      // este é um retorno que demonstra que houve 1 linha da tabela afetada durante a execução do delete na tabela de 'members_plans'
      .resolves([{ affectedRows: 1 }]);

    const response = await chai.request(app).delete('/members/1').send();

    expect(response.status).to.equal(204);
  });
  afterEach(Sinon.restore);
});

describe('Testando o endpoint de PUT /members', () => {
  it('Testando atualizar o cadastro de um membro do TrybeClub', async () => {
    // estamos dublando o método 'connection.execute' para que ele retorne tanto a quantidade de linhas afetadas com o membro atualizado
    Sinon.stub(connection, 'execute').resolves([
      { changedRows: 1, updateMemberResponse },
    ]);

    const response = await chai
      .request(app)
      .put('/members/3')
      .send(updateMember);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      message: 'Cadastro atualizado com sucesso',
      update: { ...updateMember, id: '3' },
    });
  });
  afterEach(Sinon.restore);
});
