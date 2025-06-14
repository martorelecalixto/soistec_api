const { poolPromise } = require('../db');

// Obter todos os emissores
const getEmissores = async (req, res) => {
  try {
    const { entidade } = req.query;

    if (!entidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('entidadeid', entidade);

    const result = await request.query(`
      SELECT idemissor, percomisnac, percomisint, entidadeid, percomissernac, percomisserint
      FROM emissores
      WHERE entidadeid = @entidadeid
      ORDER BY idemissor
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um emissor pelo ID
const getEmissorById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idemissor', req.params.idemissor)
      .query(`
        SELECT idemissor, percomisnac, percomisint, entidadeid, percomissernac, percomisserint
        FROM emissores
        WHERE idemissor = @idemissor
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Emissor não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo emissor
const createEmissor = async (req, res) => {
  try {
    const { percomisnac, percomisint, entidadeid, percomissernac, percomisserint  } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('entidadeid', entidadeid)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .query(`
        INSERT INTO emissores (
          percomisnac, percomisint, entidadeid, percomissernac, percomisserint 
        ) VALUES (
          @percomisnac, @percomisint, @entidadeid, @percomissernac, @percomisserint
        )
      `);

    res.status(201).json({ success: true, message: 'Emissor criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um emissor existente
const updateEmissor = async (req, res) => {
  try {
    const { percomisnac, percomisint, entidadeid, percomissernac, percomisserint  } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idemissor', req.params.idemissor)
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('entidadeid', entidadeid)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .query(`
        UPDATE emissores SET
          percomisnac = @percomisnac,
          percomisnac = @percomisnac,
          entidadeid = @entidadeid,
          percomissernac = @percomissernac,
          percomisserint = @percomisserint
        WHERE idemissor = @idemissor
      `);

    res.json({ success: true, message: 'Emissor atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um emissor
const deleteEmissor = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idemissor', req.params.idemissor)
      .query('DELETE FROM emissores WHERE idemissor = @idemissor');

    res.json({ success: true, message: 'Emissor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmissores,
  getEmissorById,
  createEmissor,
  updateEmissor,
  deleteEmissor,
};
