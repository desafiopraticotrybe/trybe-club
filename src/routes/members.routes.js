// src/routes/members.routes.js

const camelize = require('camelize');
const express = require('express');
const snakeize = require('snakeize');

const router = express.Router();

const membersDB = require('../database/members.database');
const { validateLoginUser, validateLoginPassword } = require('../middlewares/adminValidations');

router.get('/', async (_req, res) => {
  try {
    // o try executa nossa funcionalidade para o caso de sucesso da requisição
    const [result] = await membersDB.listMembers();
    res.status(200).json(result);
  } catch (err) {
    // caso algo dê errado com a query, o catch captura o erro (err) e responde com status 500 e com a mensagem do erro
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});

router.get('/admin', validateLoginUser, validateLoginPassword, async (req, res) => {
  try {
    const [[result]] = await membersDB.monthlyRevenue();
    const { monthlyRevenue } = result;
    res.status(200).json({ monthlyRevenue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // já aqui, o try também executa nossa funcionalidade para quando dá tudo certo
    const { id } = req.params;
    const [[result]] = await membersDB.listMembersById(id);
    if (result) {
      res.status(200).json(result);
    } else {
      // mas também tem uma resposta adequada para quando não é encontrado um membro com o id solicitado pelo endpoint
      res.status(404).json({ message: 'Pessoa membro não encontrada' });
    }
  } catch (err) {
    // caso algo dê errado com a query, o catch captura o erro (err) e responde com status 500 e com a mensagem do erro
    console.log(err);
    res.status(500).json({ message: err.sqlMessage });
  }
});

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

module.exports = router;
