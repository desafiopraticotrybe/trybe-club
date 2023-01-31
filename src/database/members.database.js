// src/database/members.database.js

const connection = require('./connection');

const listMembers = () => connection.execute('SELECT * FROM members');
// Note que a query de listMembersById está utilizando '?' como um placeholder do id, que é determinado no array que passamos como segundo argumento de connection.execute()
const listMembersById = (id) => connection.execute('SELECT * FROM members WHERE id = ?', [id]);

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

const deleteMember = async (memberId) => {
  await connection
  .execute('DELETE FROM trybeclub_db.members_plans WHERE member_id = ?;', [memberId]);
  const [{ affectedRows }] = await connection
  .execute('DELETE FROM trybeclub_db.members WHERE id = ?', [memberId]);
  // Estamos retornando a quantidade de linhas afetadas pelo delete
  return affectedRows;
};

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
  listMembers,
  listMembersById,
  monthlyRevenue,
  createMember,
  deleteMember,
  updateMember,
};
