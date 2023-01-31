<details>
 
 <summary><h1>Gabarito</h1></summary>

1 - Crie os testes de integração para o endpoint ***GET /members/admin*** retornando o faturamento mensal. 

> O faturamento mensal é a soma do pagamento mensal de cada pessoa membro do TrybeClub.

- A API deve ter uma resposta com status 200 e JSON conforme ao exemplo a seguir:
``` json
{
  "monthly_revenue": "89.70"
}
```

#### Solução


- Comece escrevendo um stub para seu teste:

``` javascript
// src/tests/integration/doubles/members.stub.js

/* ... */

const monthlyRevenue = {
  monthlyRevenue: '89.70',
};

module.exports = {
//  membersList,
  monthlyRevenue,
};
```

- Agora, você pode escrever o teste do endpoint ***GET /members/admin***:

``` javascript
//  src/tests/integration/people.test.js

/* ... */

const { /* membersList, */ monthlyRevenue } = require('./doubles/members.stub');

/* ... */

describe('1 - Testando o endpoint POST /members/admin', () => {
  it('Testando o endpoint do faturamento mensal do TrybeClub', async () => {
    // A query entrega um objeto dentro de um array que também está dentro de um array [[{}]]
         Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]); 

         const response = await chai.request(app).get('/members/admin');

         expect(response.status).to.equal(200);
         expect(response.body).to.deep.equal(monthlyRevenue);
  });
  afterEach(Sinon.restore);
});
```

2 - Implemente o endpoint GET ***/members/admin*** retornando o faturamento mensal.

- A API deve ter uma resposta conforme ao exemplo do exercício anterior.

#### Solução

- No arquivo `src/database/members.database.js`, escreva a função `mothlyRevenue()`, que utiliza o método `connection.execute` para executar uma query no banco de dados do TrybeClub:

Dica: se achar necessário, você pode abrir uma conexão com o banco de dados através do [instalando uma interface gráfica como o Workbench](https://app.betrybe.com/learn/course/5e938f69-6e32-43b3-9685-c936530fd326/module/94d0e996-1827-4fbc-bc24-c99fb592925b/section/fa69c314-da3c-46e0-bcdb-43297772a43e/day/89e3203d-18e4-4329-9c8d-a3f40f2e4248/lesson/4c92bf82-4e5e-49dd-b8c9-4695c79ca33e) para escrever esta query em *"baby steps"*, obtendo uma qury parecida com o exemplo a seguir:

```sql
SELECT 
    SUM(p.price) AS monthlyRevenue
FROM
    trybeclub_db.plans AS p
        INNER JOIN
    trybeclub_db.members_plans AS mp ON p.id = mp.member_id;
```

Com a query em mãos, escreva a função que execute esta query no banco de dados e retorne seu resultado.

``` javascript
// src/database/members.database.js

const connection = require('./connection');

/* ... */

const monthlyRevenue = () => connection.execute(`
SELECT 
SUM(p.price) AS monthlyRevenue 
FROM 
trybeclub_db.plans AS p 
    INNER JOIN
trybeclub_db.members_plans AS mp 
    ON 
p.id = mp.member_id;
`);

module.exports = {
//  listMembers,
//  listMembersById,
  monthlyRevenue,
};
``` 

- Agora voce pode implementar uma rota para este endpoint em `src/routes/members.routes.js`. 

> Note que o endpoint ***GET /admin*** deve vir antes do endpoint ***GET /:id***, para que não haja confusão entre eles

``` javascript
// src/routes/members.routes.js

/* ... */

// router.get('/', async (_req, res) => {
/* ... */
// });

router.get('/admin', async (req, res) => {
  try {
    const [[result]] = await membersDB.monthlyRevenue();
    const { monthlyRevenue } = result;
    res.status(200).json({ monthlyRevenue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});

// router.get('/:id', async (req, res) => {
/* ... */
// });

module.exports = router;

```

3 - Crie os testes de integração para o endpoint ***POST /members***, no qual será possível adicionar um novo membro ao TrybeClub

- Você precisa que o corpo da requisição (`req.body`) contenha um JSON com um formato conforme ao seguinte:

``` json
{
  "first_name": "Glauco",
  "last_name": "Neves",
  "email": "glauconeves@email.com",
  "phone": "21998743568",
  "plan_id": "3"
}
```

- Você também precisa a resposta da API tenha status 201 e um objeto JSON conforme ao seguinte:

``` json
{
  "member_id": "4",
  "first_name": "Glauco",
  "last_name": "Neves",
  "email": "glauconeves@email.com",
  "phone": "21998743568",
  "plan_id": "3"
}
```

#### Solução

- Comece criando o mock de um novo membro em `src/tests/integration/doubles/members.mock.js`:

``` javascript
// src/tests/integration/doubles/members.mock.js

const newMember = {
  first_name: 'Glauco',
  last_name: 'Neves',
  email: 'glauconeves@email.com',
  phone: '21998743568',
  plan_id: '3',
};

module.exports = {
  newMember,
};

```

- Agora, escreva os testes, esperando que sejam feitas duas chamadas de `connection.execute`, uma para inserir uma nova entidade na tabela `members` e outra para inserir uma nova entidade em `members_plans`:

``` javascript
// src/tests/integration/members/test/js

const { newMember } = require('./doubles/members.mock');

/* ... */ 

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
```
4 - Implemente a funcionalidade do endpoint ***POST /members***, no qual seja possível adicionar um novo membro ao TrybeClub

- Você precisa que o corpo da requisição (`req.body`) contenha um JSON conforme ao exemplo do exercício anterior.

- Você também precisa a resposta da API tenha status 201 e um objeto JSON, conforme ao exemplo do exercício anterior.


#### Solução

- Comece criando a função `createMember` em `src/database/members.database.js`:

``` javascript
// src/database/members.database.js

/* ... */ 

const createMember = async (newMember) => {
  const { firstName, lastName, email, phone, planId } = newMember;
  // Você fará duas inserções no banco de dados, primeiro na tabela 'members' e, com o 'insertId' retornado pelo db, inserir uma nova entidade na tabela 'members_plans'.
  const [{ insertId }] = await connection.execute(`
  INSERT 
  INTO 
  trybeclub_db.members 
  (first_name, last_name, email, phone) 
  VALUES 
  (?, ?, ?, ?);
`, [firstName, lastName, email, phone]);

  const [{ affectedRows }] = await connection.execute(`
  INSERT INTO trybeclub_db.members_plans (member_id, plan_id) VALUES (?, ?);
  `, [insertId, planId]);

  // o retorno das "linhas afetadas" serve apenas para atestar que houve inserção em members_plans, este valor não serve para nossa regra de negócio em si
  return { id: insertId, affectedRows };
};

module.exports = {
//  listMembers,
//  listMembersById,
//  monthlyRevenue,
  createMember,
};
```

- Agora, implemente o endpoint ***POST /*** em `src/routes/members.routes.js`

  - Note que vamos utilizar dois módulos bastante uteis, o [camelize](https://www.npmjs.com/package/camelize) e o [snakeize](https://www.npmjs.com/package/snakeize), que já vem nas dependências do TrybeClub.
  - O camelize transforma recursivamente strings de chave de camel case em estilo snake case. ou seja, o objeto é reformatado de snake_case para camelCase.
  - Já o snakeize, transforma recursivamente strings de chave de snake case em estilo camel case. ou seja, o objeto é reformatado de camelCase para snake_case.

``` javascript
// src/router/members.routes.js

/* ... */

// estes módulos já vem no package.json deste projeto e estão prontos para uso
const camelize = require('camelize');
const snakeize = require('snakeize');

router.post('/', async (req, res) => {
  try {
    // o camelize troca a formatação de um objeto com chaves escritas em snake_case para camelCase
    const { firstName, lastName, email, phone, planId } = camelize(req.body);
    const { id } = await membersDB.createMember({ firstName, lastName, email, phone, planId });
    // já o snakeize troca a formatação de um objeto com chaves em camelCase para snake_case
    const response = snakeize({ id, firstName, lastName, email, phone, planId });
    res.status(201).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});

module.exports = router;

```

5 - Crie os testes de integração para o endpoint ***DELETE /members/:id***, no qual seja possível deletar um membro do TrybeClub, a resposta deve possuir o status 204.

#### Solução

```javascript
// src/tests/integration/members.test.js

/* ... */

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
```

6 - Implemente a funcionalidade do endpoint ***DELETE /members/:id*** para que seja possível deletar um membro do TrybeClub, a resposta deve possuir o status 204.

#### Solução

- Comece criando a função `deleteMember` em `src/database/members.database.js`:

``` javascript
// src/database/members.database.js

/* ... */

const deleteMember = async (memberId) => {
  await connection
  .execute('DELETE FROM trybeclub_db.members_plans WHERE member_id = ?;', [memberId]);
  const [{ affectedRows }] = await connection
  .execute('DELETE FROM trybeclub_db.members WHERE id = ?', [memberId]);
  // Estamos retornando a quantidade de linhas afetadas pelo delete
  return affectedRows;
};

module.exports = {
//  listMembers,
//  listMembersById,
//  monthlyRevenue,
//  createMember,
  deleteMember,
};

```

- Agora você vai implementar o endpoint ***DELETE /:id*** em `src/routes/members.routes.js`

``` javascript
// src/routes/members.routes.js

/* ... */

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await membersDB.deleteMember(id);
    // Estamos verificando se conseguimos deletar alguma entidade da tabela "members_plan"
    if (!affectedRows) {
      return res.status(404).json({ message: 'Pessoa membro não encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});

```

7 - Crie os testes de integração para o endpoint ***PUT /members/:id***, no qual seja possível atualizar os dados de um membro do TrybeClub pelo seu id.

- Você precisa que o corpo da requisição (`req.body`) contenha um JSON com um formato conforme ao seguinte:

``` json
{
  "first_name": "Jandira",
  "last_name": "da Silva Junqueira Soares",
  "email": "jandirasjs@email.com",
  "phone": "48994325999",
  "plan_id": "1"
}
```

- Você também precisa que a resposta a esta requisição retorne um objeto JSON em um formato conforme ao seguinte:

``` json
{
  "message": "Cadastro atualizado com sucesso",
  "update":{
    "first_name": "Jandira",
    "last_name": "da Silva Junqueira Soares",
    "email": "jandirasjs@email.com",
    "phone": "48994325999",
    "plan_id": "1"
  }
}
```

#### Solução

- Primeiramente, você precisa criar o mock para este caso de atualização do cadastro:

``` javascript
// src/tests/integration/doubles/members.mock.js

/* ... */

const snakeize = require('snakeize');

/* ... */

const updateMember = {
  first_name: 'Jandira',
  last_name: 'da Silva Junqueira Soares',
  email: 'jandirasjs@email.com',
  phone: '48994325999',
  plan_id: '1',
};

// estamos criando este stub pois esperamos que camelize/snakeize sejam utilizados no "meio do caminho"
const updateMemberResponse = snakeize(updateMember);

module.exports = {
//  newMember,
  updateMember,
  updateMemberResponse,
};

```

- Agora você pode escrever os testes da atualização do cadastro de um membro do TrybeClub:

``` javascript
// src/tests/integration/members/test/js

/* ... */ 

const { 
//  newMember, 
  updateMemberResponse,
  updateMember, 
} = require('./doubles/members.mock');

/* ... */

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

```

8 -  Implemente a funcionalidade do endpoint ***PUT /members/:id***, no qual seja possível atualizar os dados de um membro do TrybeClub pelo seu id.

- Você precisa que o corpo da requisição (`req.body`) contenha um JSON conforme ao exemplo do exercício anterior..

- Você também precisa que a resposta a esta requisição retorne um objeto JSON conforme ao exercício anterior.

#### Solução

- Comece criando a função `updateMember` em `src/database/members.database.js`:

```javascript
// src/database/members.database.js

/* ... */

const updateMember = async (memberUp) => {
  const { firstName, lastName, email, phone, id, planId } = memberUp;

  await connection.execute(`
  UPDATE trybeclub_db.members 
  SET first_name = ?, last_name = ?, email = ?, phone = ? 
  WHERE id = ?;`,
   [firstName, lastName, email, phone, id]);

   // Changed rows é o valor de linhas mudadas ao update
   const [{ changedRows }] = await connection
   .execute('UPDATE trybeclub_db.members_plans SET plan_id = ? WHERE member_id = ?;', 
   [planId, id]);
   // retornamos changedRows e o objeto update com os dados atualizados
   return { changedRows, update: { firstName, lastName, email, phone, planId, id } };
};

module.exports = {
//  listMembers,
//  listMembersById,
//  monthlyRevenue,
//  createMember,
//  deleteMember,
  updateMember,
};

```

- Agora você vai implementar o endpoint ***PUT /:id*** em `src/routes/members.routes.js`

``` javascript
// src/routes/members.routes.js

/* ... */

router.put('/:id', async (req, res) => {
  try {
  const { id } = req.params;
  const member = camelize(req.body);
  const { changedRows, update } = await membersDB.updateMember({ ...member, id });
  if (!changedRows) {
    return res.status(200).json({ message: 'Pessoa membro já estava com todos dados atualizados' });
  }
  res.status(200).json({ message: 'Cadastro atualizado com sucesso', update: snakeize(update) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});
```
### Exercícios Bônus

9 - Crie os testes de integração da requisição do endpoint ***GET /members/admin*** para que valide o acesso somente para o administrador do TrybeClub:

- O administrador do TrybeClub precisa que este endpoint seja acessível apenas com seu login, que precisa estar no corpo da requisição no seguinte formato:

``` json
{
    "user": "admin",
  "password": "xablau"
}

```

- Você deve criar middlewares de validação para os seguintes casos:

  - Quando a chave `"user"` não estiver definida no corpo da requisição, a resposta deve ter status 400 e um JSON como o seguinte:

``` json
{
  "message": "user não informado."
}
```

  - Quando a chave `"user"` for diferente de `"admin"`, a resposta deve ter status 401 e um JSON como o seguinte:

``` json
{
  "message": "user inválido."
}
```

  - Quando a chave `"password"` não estiver definida no corpo da requisição, a resposta deve ter status 400 e um JSON como o seguinte:

``` json
{
  "message": "password não informado."
}
```

  - Quando a chave `"password"` for diferente de `"xablau"`, a resposta deve ter status 401 e um JSON como o seguinte:

``` json
{
  "message": "password inválido."
}
```

- Trabalhando em TDD, você pode começar criando casos de teste para cada um dos casos acima.

Dicas:

- o middleware deve ser uma função callback que anteceda a função callback criada para o endpoint ***GET /members/admin***.

- Quando houver algo errado, cada middleware deve retornar uma resposta com status e JSON adequados,

- quando estiver tudo certo, cada middleware deve chamar `next()` e passar para o próximo middleware da rota.

#### Solução

- Crie os mocks necessários para os testes em `src/tests/integration/doubles/members.mock.js`:

```javascript
// src/tests/integration/doubles/members.mock.js

/* ... */ 

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
//  newMember, 
//  updateMemberResponse,
//  updateMember, 
  adminMock,
  wrongUserAdminMock,
  wrongPasswordAdminMock,
};
```

- Agora, escreva os testes para cada uma das validações a serem feitas:

```javascript
// src/tests/integration/members.test.js

/* ... */

// describe('Testando o endpoint de POST /members/admin ', () => {
  // it('Testando o endpoint do faturamento mensal do TrybeClub', async () => {

  /* ... */

  // });
  it('Testando quando o user não for informado', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai.request(app).get('/members/admin').send({ password: 'xablau' });

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ message: 'user não informado.' });
  }); 
  it('Testando quando o user for inválido', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai.request(app).get('/members/admin').send(wrongUserAdminMock);

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'user inválido.' });
  }); 
    it('Testando quando o password não for informado', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai.request(app).get('/members/admin').send({ user: 'admin' });

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ message: 'password não informado.' });
  }); 
  it('Testando quando o password for inválido', async () => {
    Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);

    const response = await chai.request(app).get('/members/admin').send(wrongPasswordAdminMock);

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'password inválido.' });
  }); 
  // afterEach(Sinon.restore);
// });
```

Finalmente, para que o teste realizado no exercício 1 esteja de acordo com a nova regra, você precisa alterar a requisição feita através do Chai

``` javascript
// src/tests/integration/members.test.js

/* ... */

const { 
//  newMember, 
//  updateMemberResponse,
//  updateMember,
//  wrongUserAdminMock, 
//  wrongPasswordAdminMock, 
  adminMock,
} = require('./doubles/members.mock');

/* ... */


// describe('1 - Testando o endpoint POST /members/admin', () => {
  it('Testando o endpoint do faturamento mensal do TrybeClub com o login de admin', async () => {
//     // A query entrega um objeto dentro de um array que também está dentro de um array [[{}]]
//     Sinon.stub(connection, 'execute').resolves([[monthlyRevenue]]);
 
    const response = await chai.request(app).get('/members/admin').send(adminMock);

//     expect(response.status).to.equal(200);
//     expect(response.body).to.deep.equal(monthlyRevenue);
//   });
//   afterEach(Sinon.restore);
});

```

10 - Implemente as validações do login do administrador do TrybeClub, conforme aos requisitos e dicas do exercício anterior:

#### Solução

Escreva as funções `validateLoginUser` e `validateLoginPassword` no arquivo `adminValidations.js` em `src/middlewares/adminValidations.js`.

``` javascript
// src/middlewares/adminValidations.js

const validateLoginUser = (req, res, next) => {
  const { user } = req.body;
  if (!user) return res.status(400).json({ message: 'user não informado.' });
  if (user !== 'admin') return res.status(401).json({ message: 'user inválido.' });
  next();
};

const validateLoginPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'password não informado.' });
  if (password !== 'xablau') return res.status(401).json({ message: 'password inválido.' });
  next();
};

module.exports = {
  validateLoginUser,
  validateLoginPassword,
};

```

- Altere `src/routes/members.routes.js` para adicionar os middlewares criados no endpoint ***GET /members/admin***:

``` javascript
// src/routes/members.routes.js

/* ... */

const { validateLoginUser, validateLoginPassword } = require('../middlewares/adminValidations');

/* ... */

router.get('/admin', validateLoginUser, validateLoginPassword, async (req, res) => {
//  try {
//    const [[result]] = await membersDB.monthlyRevenue();
//    const { monthlyRevenue } = result;
//    res.status(200).json({ monthlyRevenue });
//  } catch (err) {
//    console.log(err);
//    res.status(500).json({ message: err.sqlMessage });
//  }
});

```
</details>
