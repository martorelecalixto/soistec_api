const { poolPromise } = require('../db');

// Obter todas as vendasbilhete
const getVendasBilhete = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE vendasbilhetes.empresa = @empresa AND vendasbilhetes.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendasbilhetes.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendasbilhetes.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendasbilhetes.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendasbilhetes.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendasbilhetes.datavenda <= @datafinal';
    }

    whereClause += ' GROUP BY vendasbilhetes.idvenda, vendasbilhetes.valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,  ' + //
                   ' vendasbilhetes.observacao, vendasbilhetes.solicitante, vendasbilhetes.identidade, ' +
                   ' vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome, formapagamento.nome, ' +
                   ' vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento, ' +
                   ' vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo, ' +
                   ' entidades_1.nome, entidades_2.nome ';

    whereClause += ' ORDER BY vendasbilhetes.datavenda desc ';

    const query =
     `SELECT vendasbilhetes.idvenda, ISNULL(vendasbilhetes.valortotal,0) AS valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
        vendasbilhetes.observacao, ISNULL(vendasbilhetes.solicitante,'') AS solicitante, vendasbilhetes.identidade, 
        vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome AS entidade, formapagamento.nome AS pagamento,
        vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento,
        vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
        entidades_1.nome AS vendedor, entidades_2.nome AS emissor
        FROM vendasbilhetes INNER JOIN
            entidades ON vendasbilhetes.identidade = entidades.identidade LEFT OUTER JOIN
            filiais ON vendasbilhetes.idfilial = filiais.idfilial LEFT OUTER JOIN
            moeda ON vendasbilhetes.idmoeda = moeda.idmoeda LEFT OUTER JOIN
            formapagamento ON vendasbilhetes.idformapagamento = formapagamento.idformapagamento LEFT OUTER JOIN
            entidades entidades_2 ON vendasbilhetes.idemissor = entidades_2.identidade LEFT OUTER JOIN
            entidades entidades_1 ON vendasbilhetes.idvendedor = entidades_1.identidade LEFT OUTER JOIN
            grupos ON vendasbilhetes.idgrupo = grupos.id LEFT OUTER JOIN
            itensvendabilhete ON vendasbilhetes.idvenda = itensvendabilhete.idvenda ${whereClause}  `
   const result = await request.query(query);
   //console.log(result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma vendasb pelo ID
const getVendasBilheteById = async (req, res) => {
  try {
    const { idvenda } = req.params;

    if (!idvenda) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idvenda" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda', idvenda)
      .query(`
        SELECT vendasbilhetes.idvenda, ISNULL(vendasbilhetes.valortotal,0) AS valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
            vendasbilhetes.observacao, ISNULL(vendasbilhetes.solicitante,'') AS solicitante, vendasbilhetes.identidade, 
            vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome AS entidade, formapagamento.nome AS pagamento,
            vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento,
            vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
            entidades_1.nome AS vendedor, entidades_2.nome AS emissor
            FROM vendasbilhetes INNER JOIN
                entidades ON vendasbilhetes.identidade = entidades.identidade LEFT OUTER JOIN
                filiais ON vendasbilhetes.idfilial = filiais.idfilial LEFT OUTER JOIN
                moeda ON vendasbilhetes.idmoeda = moeda.idmoeda LEFT OUTER JOIN
                formapagamento ON vendasbilhetes.idformapagamento = formapagamento.idformapagamento LEFT OUTER JOIN
                entidades entidades_2 ON vendasbilhetes.idemissor = entidades_2.identidade LEFT OUTER JOIN
                entidades entidades_1 ON vendasbilhetes.idvendedor = entidades_1.identidade LEFT OUTER JOIN
                grupos ON vendasbilhetes.idgrupo = grupos.id LEFT OUTER JOIN
                itensvendabilhete ON vendasbilhetes.idvenda = itensvendabilhete.idvenda   
        WHERE vendasbilhetes.idvenda = @idvenda

        GROUP BY vendasbilhetes.idvenda, vendasbilhetes.valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
                  vendasbilhetes.observacao, vendasbilhetes.solicitante, vendasbilhetes.identidade, 
                  vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome, formapagamento.nome,
                  vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento, 
                  vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
                  entidades_1.nome, entidades_2.nome 

      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
const getVendasBilheteById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query(
        `SELECT vendasbilhetes.datavenda, vendasbilhetes.valortotal, vendasbilhetes.id, vendasbilhetes.idfatura, 
         entidades.nome AS entidade, vendasbilhetes.idreciboreceber, formapagamento.nome AS pagamento
         FROM vendasbilhetes INNER JOIN
            entidades ON vendasbilhetes.identidade = entidades.identidade LEFT OUTER JOIN
            filiais ON vendasbilhetes.idfilial = filiais.idfilial LEFT OUTER JOIN
            moeda ON vendasbilhetes.idmoeda = moeda.idmoeda LEFT OUTER JOIN
            formapagamento ON vendasbilhetes.idformapagamento = formapagamento.idformapagamento LEFT OUTER JOIN
            entidades entidades_2 ON vendasbilhetes.idemissor = entidades_2.identidade LEFT OUTER JOIN
            entidades entidades_1 ON vendasbilhetes.idvendedor = entidades_1.identidade LEFT OUTER JOIN
            grupos ON vendasbilhetes.idgrupo = grupos.id LEFT OUTER JOIN
            itensvendabilhete ON vendasbilhetes.idvenda = itensvendabilhete.idvenda WHERE vendasbilhetes.idvenda = @idvenda ORDER BY vendasbilhetes.datavenda DESC `
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('venda não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};
*/

// Criar uma nova venda
const createVendasBilhete = async (req, res) => {
  try {
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      cartao_sigla,
      cartao_numero,
      cartao_mesvencimento,
      cartao_anovencimento,
      observacao,
      solicitante,
      identidade,
      idvendedor,
      idemissor,
      idmoeda,
      idformapagamento,
      idfilial,
      idfatura,
      idreciboreceber,
      chave,
      excluido,
      empresa,
      idcentrocusto,
      idgrupo,
      id,
      valorentrada
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('datavenda', datavenda)
      .input('datavencimento', datavencimento)
      .input('documento', documento)
      .input('valortotal', valortotal)
      .input('descontototal', descontototal)
      .input('cartao_sigla', cartao_sigla)
      .input('cartao_numero', cartao_numero)
      .input('cartao_mesvencimento', cartao_mesvencimento)
      .input('cartao_anovencimento', cartao_anovencimento)
      .input('observacao', observacao)
      .input('solicitante', solicitante)
      .input('identidade', identidade)
      .input('idvendedor', idvendedor)
      .input('idemissor', idemissor)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idfilial', idfilial)
      .input('idfatura', idfatura)
      .input('idreciboreceber', idreciboreceber)
      .input('chave', chave)
      .input('excluido', excluido)
      .input('empresa', empresa)
      .input('idcentrocusto', idcentrocusto)
      .input('idgrupo', idgrupo)
      .input('id', id)
      .input('valorentrada', valorentrada)
      .query(`
        INSERT INTO vendasbilhetes (
          datavenda, datavencimento, documento, valortotal, descontototal,
          cartao_sigla, cartao_numero, cartao_mesvencimento, cartao_anovencimento,
          observacao, solicitante, identidade, idvendedor, idemissor, idmoeda,
          idformapagamento, idfilial, idfatura, idreciboreceber, chave, excluido,
          empresa, idcentrocusto, idgrupo, id, valorentrada
        )
        OUTPUT INSERTED.idvenda
        VALUES (
          @datavenda, @datavencimento, @documento, @valortotal, @descontototal,
          @cartao_sigla, @cartao_numero, @cartao_mesvencimento, @cartao_anovencimento,
          @observacao, @solicitante, @identidade, @idvendedor, @idemissor, @idmoeda,
          @idformapagamento, @idfilial, @idfatura, @idreciboreceber, @chave, @excluido,
          @empresa, @idcentrocusto, @idgrupo, @id, @valorentrada
        )
      `);

    const idvenda = result.recordset[0].idvenda;

    res.status(201).json({ success: true, idvenda, message: 'Venda criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
const createVendasBilhete = async (req, res) => {
  try {
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      cartao_sigla,
      cartao_numero,
      cartao_mesvencimento,
      cartao_anovencimento,
      observacao,
      solicitante,
      identidade,
      idvendedor,
      idemissor,
      idmoeda,
      idformapagamento,
      idfilial,
      idfatura,
      idreciboreceber,
      chave,
      excluido,
      empresa,
      idcentrocusto,
      idgrupo,
      id,
      valorentrada
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('datavenda', datavenda)
      .input('datavencimento', datavencimento)
      .input('documento', documento)
      .input('valortotal', valortotal)
      .input('descontototal', descontototal)
      .input('cartao_sigla', cartao_sigla)
      .input('cartao_numero', cartao_numero)
      .input('cartao_mesvencimento', cartao_mesvencimento)
      .input('cartao_anovencimento', cartao_anovencimento)
      .input('observacao', observacao)
      .input('solicitante', solicitante)
      .input('identidade', identidade)
      .input('idvendedor', idvendedor)
      .input('idemissor', idemissor)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idfilial', idfilial)
      .input('idfatura', idfatura)
      .input('idreciboreceber', idreciboreceber)
      .input('chave', chave)
      .input('excluido', excluido)
      .input('empresa', empresa)
      .input('idcentrocusto', idcentrocusto)
      .input('idgrupo', idgrupo)
      .input('id', id)
      .input('valorentrada', valorentrada)
      .query(`
        INSERT INTO vendasbilhetes (
          datavenda, datavencimento, documento, valortotal, descontototal,
          cartao_sigla, cartao_numero, cartao_mesvencimento, cartao_anovencimento,
          observacao, solicitante, identidade, idvendedor, idemissor, idmoeda,
          idformapagamento, idfilial, idfatura, idreciboreceber, chave, excluido,
          empresa, idcentrocusto, idgrupo, id, valorentrada
        )
        VALUES (
          @datavenda, @datavencimento, @documento, @valortotal, @descontototal,
          @cartao_sigla, @cartao_numero, @cartao_mesvencimento, @cartao_anovencimento,
          @observacao, @solicitante, @identidade, @idvendedor, @idemissor, @idmoeda,
          @idformapagamento, @idfilial, @idfatura, @idreciboreceber, @chave, @excluido,
          @empresa, @idcentrocusto, @idgrupo, @id, @valorentrada
        )
      `);

    res.status(201).json({ success: true, message: 'Venda criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

// Atualizar uma vendas existente
const updateVendasBilhete = async (req, res) => {
  try {
   // console.log('ENTROU NA API');
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      cartao_sigla,
      cartao_numero,
      cartao_mesvencimento,
      cartao_anovencimento,
      observacao,
      solicitante,
      identidade,
      idvendedor,
      idemissor,
      idmoeda,
      idformapagamento,
      idfilial,
      idfatura,
      idreciboreceber,
      chave,
      excluido,
      empresa,
      idcentrocusto,
      idgrupo,
      id,
      valorentrada
    } = req.body;
    //console.log(req.body);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .input('datavenda', datavenda)
      .input('datavencimento', datavencimento)
      .input('documento', documento)
      .input('valortotal', valortotal)
      .input('descontototal', descontototal)
      .input('cartao_sigla', cartao_sigla)
      .input('cartao_numero', cartao_numero)
      .input('cartao_mesvencimento', cartao_mesvencimento)
      .input('cartao_anovencimento', cartao_anovencimento)
      .input('observacao', observacao)
      .input('solicitante', solicitante)
      .input('identidade', identidade)
      .input('idvendedor', idvendedor)
      .input('idemissor', idemissor)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idfilial', idfilial)
      .input('idfatura', idfatura)
      .input('idreciboreceber', idreciboreceber)
      .input('chave', chave)
      .input('excluido', excluido)
      .input('empresa', empresa)
      .input('idcentrocusto', idcentrocusto)
      .input('idgrupo', idgrupo)
      .input('id', id)
      .input('valorentrada', valorentrada)
      .query(`
        UPDATE vendasbilhetes SET
          datavenda = @datavenda,
          datavencimento = @datavencimento,
          documento = @documento,
          valortotal = @valortotal,
          descontototal = @descontototal,
          cartao_sigla = @cartao_sigla,
          cartao_numero = @cartao_numero,
          cartao_mesvencimento = @cartao_mesvencimento,
          cartao_anovencimento = @cartao_anovencimento,
          observacao = @observacao,
          solicitante = @solicitante,
          identidade = @identidade,
          idvendedor = @idvendedor,
          idemissor = @idemissor,
          idmoeda = @idmoeda,
          idformapagamento = @idformapagamento,
          idfilial = @idfilial,
          idfatura = @idfatura,
          idreciboreceber = @idreciboreceber,
          chave = @chave,
          excluido = @excluido,
          empresa = @empresa,
          idcentrocusto = @idcentrocusto,
          idgrupo = @idgrupo,
          id = @id,
          valorentrada = @valorentrada
        WHERE idvenda = @idvenda
      `);

    res.json({ success: true, message: 'Venda atualizada com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar uma vendas
const deleteVendasBilhete = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query('DELETE FROM vendasbilhetes WHERE idvenda = @idvenda');
    res.json({ success: true, message: 'Venda deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getVendasBilhete,
  getVendasBilheteById,
  createVendasBilhete,
  updateVendasBilhete,
  deleteVendasBilhete,
};
