import express from 'express'
import cors from 'cors'
//import sqlite3 from 'sqlite3';
//import { open } from 'sqlite';
import { config as dotenvConfig } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import mysql from 'mysql2'
import { google } from 'googleapis';

const servidor = express();
servidor.use(express.json());
servidor.use(cors({
	//origin: 'http://meudominio.com'
}));

dotenvConfig();

//const abrirBanco = open({
//	filename: 'db-bkp.sqlite',
//	driver: sqlite3.Database
//});

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORTA,
	database: process.env.DB_BANCO,
	user: process.env.DB_USUARIO,
	password: process.env.DB_SENHA
}).promise();

const OAuth2 = google.auth.OAuth2;
const oAuth2Client = new OAuth2(
	process.env.OAUTH_CLIENTID,
	process.env.OAUTH_CLIENT_SECRET,
	'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
	refresh_token: process.env.OAUTH_REFRESH_TOKEN
});

const BCRYPT_SALT_ROUNDS = 10;

const DURACAO_DO_TOKEN_DE_SESSAO = 7 * 24*60*60*1000; //uma semana
const DURACAO_DO_TOKEN_DE_RECUPERACAO = 10*60*1000; //10 minutos

//procedimentos iniciais
async function iniciar() {
	await pool.query(`DELETE FROM sessao WHERE data_de_expiracao < FROM_UNIXTIME(${Date.now()/1000});`);
	await pool.query(`DELETE FROM recuperacao_de_conta
		WHERE data_de_criacao < FROM_UNIXTIME(${(Date.now() - DURACAO_DO_TOKEN_DE_RECUPERACAO) / 1000});`
	);

	////criação das tabelas
	//console.log('criando tabela "jogo"...');
	//await pool.query(`CREATE TABLE IF NOT EXISTS jogo (
	//	id CHAR(36) PRIMARY KEY,
	//	nome VARCHAR(255) NOT NULL,
	//	nome_url VARCHAR(255) NOT NULL,
	//	url_da_imagem VARCHAR(255) NOT NULL
	//);`
	//);
	//console.log('tabela "jogo" criada.');

	//console.log('criando tabela "usuario"...');
	//await pool.query(`CREATE TABLE IF NOT EXISTS usuario (
	//	id CHAR(36) PRIMARY KEY,
	//	nome_de_usuario VARCHAR(255) NOT NULL UNIQUE,
	//	nome_de_exibicao VARCHAR(255) NOT NULL,
	//	email VARCHAR(255) NOT NULL UNIQUE,
	//	hash_da_senha CHAR(60) NOT NULL,
	//	data_de_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	//);`
	//);
	//console.log('tabela "usuario" criada.');

	//console.log('criando tabela "sessao"...');
	//await pool.query(`CREATE TABLE IF NOT EXISTS sessao (
	//	id CHAR(36) PRIMARY KEY,
	//	id_do_usuario CHAR(36) NOT NULL,
	//	seletor CHAR(8) NOT NULL,
	//	hash_do_token CHAR(60) NOT NULL,
	//	manter_sessao BOOLEAN NOT NULL,
	//	data_de_expiracao DATETIME NOT NULL,
	//	data_de_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	//	FOREIGN KEY (id_do_usuario) REFERENCES usuario (id)
	//	ON DELETE CASCADE
	//);`
	//);
	//console.log('tabela "sessao" criada.');

	//console.log('criando tabela "recuperacao_de_conta"...');
	//await pool.query(`CREATE TABLE IF NOT EXISTS recuperacao_de_conta (
	//	id CHAR(36) PRIMARY KEY,
	//	id_do_usuario CHAR(36) NOT NULL,
	//	hash_do_token CHAR(60) NOT NULL,
	//	data_de_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	//	FOREIGN KEY (id_do_usuario) REFERENCES usuario (id)
	//	ON DELETE CASCADE
	//);`
	//);
	//console.log('tabela "recuperacao_de_conta" criada.');

	//console.log('criando tabela "anuncio"...');
	//await pool.query(`CREATE TABLE IF NOT EXISTS anuncio (
	//	id CHAR(36) PRIMARY KEY,
	//	id_do_jogo CHAR(36) NOT NULL,
	//	id_do_usuario CHAR(36) NOT NULL,
	//	nome_no_jogo VARCHAR(255) NOT NULL,
	//	tempo_de_jogo_em_meses INT NOT NULL,
	//	discord VARCHAR(255) NOT NULL,
	//	usa_chat_de_voz BOOLEAN NOT NULL,
	//	data_de_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	//	FOREIGN KEY (id_do_usuario) REFERENCES usuario (id)
	//	ON DELETE CASCADE
	//);`
	//);
	//console.log('tabela "anuncio" criada.');

	//console.log('criando tabela "disponibilidade"...');
	//await pool.query(
	//	`CREATE TABLE IF NOT EXISTS disponibilidade (
	//		id INT AUTO_INCREMENT PRIMARY KEY,
	//		id_do_anuncio CHAR(36) NOT NULL,
	//		hora_de_inicio INT NOT NULL,
	//		hora_de_termino INT NOT NULL,
	//		FOREIGN KEY (id_do_anuncio) REFERENCES anuncio (id)
	//		ON DELETE CASCADE
	//	);`
	//);
	//console.log('tabela "disponibilidade" criada.');

	//console.log('criando tabela "dia_da_disponibilidade"...');
	//await pool.query(`CREATE TABLE IF NOT EXISTS dia_da_disponibilidade (
	//	id INT AUTO_INCREMENT PRIMARY KEY,
	//	id_da_disponibilidade INT NOT NULL,
	//	dia INT NOT NULL,
	//	FOREIGN KEY (id_da_disponibilidade) REFERENCES disponibilidade (id)
	//	ON DELETE CASCADE
	//);`
	//);
	//console.log('tabela "dia_da_disponibilidade" criada.');


	////preparação dos dados
	//console.log('obtendo dados do arquivo "db-bkp.sqlite"...');
	//const db = await abrirBanco;
	//const jogos = await db.all(`SELECT * FROM Jogos;`);
	//const usuarios = await db.all(`SELECT * FROM Usuarios;`);
	//const anuncios = await db.all(`SELECT * FROM Anuncios;`);
	//const disponibilidades = await db.all(`SELECT * FROM Disponibilidades;`);
	//const diasDasDisponibilidades = await db.all(`SELECT * FROM DiasDasDisponibilidades;`);
	//console.log('dados obtidos.');

	//console.log('jogos:');
	//console.log(jogos);

	//usuarios.map((usuario,i)=>{
	//	usuario.uuid = uuidv4();
	//	if (!usuario.email)
	//		usuario.email = 'email'+i+'@vaz.io';
	//	usuario.dataDeCriacaoEmSeg = parseInt(usuario.dataDeCriacao/1000);
	//});
	//console.log('usuarios:');
	//console.log(usuarios.filter((a,i)=>i<5));

	//anuncios.map(anuncio=>{
	//	if (!anuncio.uuid)
	//		anuncio.uuid = uuidv4();
	//	anuncio.uuidDoJogo = jogos[anuncio.idDoJogo-1].uuid;
	//	usuarios.some(usuario=>{
	//		if (usuario.id == anuncio.idDoUsuario)
	//			anuncio.uuidDoUsuario = usuario.uuid;
	//	})
	//	anuncio.dataDeCriacaoEmSeg = parseInt(anuncio.dataDeCriacao/1000);
	//});
	//console.log('anuncios:');
	//console.log(anuncios.filter((a,i)=>i<5));

	//anuncios.map(anuncio=>{
	//	if (!anuncio.uuid)
	//		anuncio.uuid = uuidv4();
	//});

	//disponibilidades.map(disp=>{
	//	anuncios.some(anuncio=>{
	//		if (anuncio.idDoAnuncio == disp.idDoAnuncio)
	//			disp.uuidDoAnuncio = anuncio.uuid;
	//	})
	//});
	//console.log('disponibilidades:');
	//console.log(disponibilidades.filter((a,i)=>i<5));

	//console.log('diasDasDisponibilidades:');
	//console.log(diasDasDisponibilidades.filter((a,i)=>i<5));


	////importação dos dados
	//let i = 0;
	
	//console.log('inserindo dados na tabela "jogo"...');
	//i = 0;
	//while (i < jogos.length) {
	//	await pool.query(
	//		`INSERT INTO jogo (id, nome, nome_url, url_da_imagem)
	//		VALUES (?,?,?,?);`,
	//		[
	//			jogos[i].uuid, jogos[i].nome, jogos[i].nomeUrl, jogos[i].urlImagem
	//		]
	//	);
	//	i++;
	//}
	//const [jogoMysql] = await pool.query(`SELECT * FROM jogo;`);
	//console.log('importou jogos');
	//console.log(jogoMysql);

	//console.log('inserindo dados na tabela "usuario"...');
	//i = 0;
	//while (i < usuarios.length) {
	//	await pool.query(
	//		`INSERT INTO usuario (id, nome_de_usuario, nome_de_exibicao, email, hash_da_senha, data_de_criacao)
	//		VALUES (?,?,?,?,?,FROM_UNIXTIME(?));`,
	//		[
	//			usuarios[i].uuid, usuarios[i].nome, usuarios[i].nome, usuarios[i].email, usuarios[i].senhaHash,
	//	 		usuarios[i].dataDeCriacaoEmSeg
	//		]
	//	);
	//	i++;
	//}
	//const [usuarioMysql] = await pool.query(`SELECT * FROM usuario;`);
	//console.log('importou usuarios');
	//console.log(usuarioMysql);

	//console.log('inserindo dados na tabela "anuncio"...');
	//i = 0;
	//while (i < anuncios.length) {
	//	await pool.query(
	//		`INSERT INTO anuncio (id, id_do_jogo, id_do_usuario, nome_no_jogo, tempo_de_jogo_em_meses,
	//		discord, usa_chat_de_voz, data_de_criacao)
	//		VALUES (?,?,?,?,?,?,?,FROM_UNIXTIME(?));`,
	//		[
	//			anuncios[i].uuid, anuncios[i].uuidDoJogo, anuncios[i].uuidDoUsuario, anuncios[i].nomeNoJogo,
	//			anuncios[i].tempoDeJogoEmMeses, anuncios[i].discord, anuncios[i].usaChatDeVoz, anuncios[i].dataDeCriacaoEmSeg
	//		]
	//	);
	//	i++;
	//}
	//const [anuncioMysql] = await pool.query(`SELECT * FROM anuncio;`);
	//console.log('importou anuncios');
	//console.log(anuncioMysql.filter((a,i)=>i<5));

	//console.log('inserindo dados na tabela "disponibilidade"...');
	//i = 0;
	//while (i < disponibilidades.length) {
	//	await pool.query(
	//		`INSERT INTO disponibilidade (id, id_do_anuncio, hora_de_inicio, hora_de_termino)
	//		VALUES (?,?,?,?);`,
	//		[
	//			disponibilidades[i].id, disponibilidades[i].uuidDoAnuncio, disponibilidades[i].horaDeInicio,
	//			disponibilidades[i].horaDeTermino
	//		]
	//	);
	//	i++;
	//}
	//const [disponibilidadeMysql] = await pool.query(`SELECT * FROM disponibilidade;`);
	//console.log('importou disponibilidades');
	//console.log(disponibilidadeMysql.filter((a,i)=>i<5));

	//console.log('inserindo dados na tabela "dia_da_disponibilidade"...');
	//i = 0;
	//while (i < diasDasDisponibilidades.length) {
	//	await pool.query(
	//		`INSERT INTO dia_da_disponibilidade (id_da_disponibilidade, dia)
	//		VALUES (?,?);`,
	//		[
	//			diasDasDisponibilidades[i].idDaDisponibilidade, diasDasDisponibilidades[i].dia
	//		]
	//	);
	//	i++;
	//}
	//const [dia_da_disponibilidadeMysql] = await pool.query(`SELECT * FROM dia_da_disponibilidade;`);
	//console.log('importou dias das disponibilidades');
	//console.log(dia_da_disponibilidadeMysql.filter((a,i)=>i<5));
}
iniciar();

servidor.get('/', async (req, resp)=>{
	try {
    console.log('Servidor acessado com sucesso.');
		return resp.status(200).json({status: 'Servidor acessado com sucesso.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//retorna uma lista de jogos
servidor.get('/jogos', async (req, resp)=>{
	try {
		const ordenarPor = req.query.ordenarPor;
		const qtde = parseInt(req.query.qtde);
		if (req.query.qtde && isNaN(qtde))
			return resp.status(400).json({erro: 'Quantidade em formato inválido.'});
		const [jogos] = await pool.query(
			`SELECT jogo.id, nome, nome_url AS nomeUrl, url_da_imagem AS urlImagem, COUNT(anuncio.id) AS qtdeAnuncios
			FROM jogo LEFT JOIN anuncio
			ON jogo.id = anuncio.id_do_jogo
			GROUP BY jogo.id
			ORDER BY ${ordenarPor == 'anuncio' ? 'MAX(anuncio.data_de_criacao) DESC' : 'nomeUrl ASC'}
			${qtde > 0 ? 'LIMIT '+qtde : ''};`
		);
		console.log('GET jogos, qtde='+jogos.length+', ip='+req.ip);
		return resp.status(200).json(jogos);
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//para guardar no banco de dados
function converterHoraStringParaMinutos(horaString) {
	const [horas, minutos] = horaString.split(':').map(Number);
	return horas*60 + minutos;
}

//para exibir no cliente
function converterMinutosParaHoraString(minutos) {
	const hora = Math.floor(minutos/60);
	const minuto = minutos%60;
	return String(hora).padStart(2,'0') + ':' + String(minuto).padStart(2,'0');
}

//publica um anúncio
servidor.post('/anuncios', async (req, resp)=>{
	try {
		console.log('POST anuncios, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		const anuncio = req.body.anuncio;
		if (sessaoExiste.idDoUsuario != anuncio.idDoUsuario) {
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.', codigo: 409});
		}
		
		if(isNaN(anuncio.tempoDeJogoEmMeses))
			return resp.status(400).json({erro: 'Tempo de jogo em formato inválido.'});

		for (let i = 0; i < anuncio.disponibilidades.length; i++) {
			let dias = anuncio.disponibilidades[i].dias.split(',').map(d=>parseInt(d));
			let horaDe = anuncio.disponibilidades[i].horaDeInicio;
			let horaAte = anuncio.disponibilidades[i].horaDeTermino;
			for (let j = 0; j < dias.length; j++)
				if (isNaN(dias[j]) || dias[j] < 0 || dias[j] > 6)
					return resp.status(400).json({erro: 'Dias em formato inválido.'});
			//formato da hora deve ser 2 números, ':', 2 números, sem caracteres antes nem depois
			if (!horaDe.match(/^\d{2}:\d{2}$/))
				return resp.status(400).json({erro: 'Horário em formato inválido.'});
			if (!horaAte.match(/^\d{2}:\d{2}$/))
				return resp.status(400).json({erro: 'Horário em formato inválido.'});
		}

    if (anuncio.usaChatDeVoz === true)
      anuncio.usaChatDeVoz = true;
    else
      anuncio.usaChatDeVoz = false;

		const anuncioPublicado = {};
		anuncioPublicado.idDoAnuncio = uuidv4();
		await pool.query(
			`INSERT INTO anuncio (id, id_do_jogo, id_do_usuario, nome_no_jogo, tempo_de_jogo_em_meses,
			discord, usa_chat_de_voz)
			VALUES (?,?,?,?,?,?,?);`,
			[
				anuncioPublicado.idDoAnuncio, anuncio.idDoJogo, sessaoExiste.idDoUsuario, anuncio.nomeNoJogo,
				anuncio.tempoDeJogoEmMeses, anuncio.discord, anuncio.usaChatDeVoz
			]
		);

		let i = 0;
		while (i < anuncio.disponibilidades.length) {
			await pool.query(
				`INSERT INTO disponibilidade (id_do_anuncio, hora_de_inicio, hora_de_termino) VALUES (?,?,?);`,
				[
					anuncioPublicado.idDoAnuncio,
					converterHoraStringParaMinutos(anuncio.disponibilidades[i].horaDeInicio),
					converterHoraStringParaMinutos(anuncio.disponibilidades[i].horaDeTermino)
				]
			);
			const [[disp]] = await pool.query(
				`SELECT MAX(id) AS id FROM disponibilidade WHERE id_do_anuncio = '${anuncioPublicado.idDoAnuncio}';`
			);
			let j = 0;
			let dias = anuncio.disponibilidades[i].dias.split(',').map(d=>parseInt(d));
			while (j < dias.length) {
				await pool.query(
					`INSERT INTO dia_da_disponibilidade (id_da_disponibilidade, dia) VALUES (?,?);`,
					[disp.id, dias[j]]
				);
				j++;
			}
			i++;
		}

		console.log('Anúncio publicado, id='+anuncioPublicado.idDoAnuncio+'.');
		return resp.status(201).json({ok: 'Anúncio publicado.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//pesquisa anúncios
async function pesquisar(query, idDoUsuario) {
	try {
		const camposPesquisados = {};
		for (let c in query)
			if(query[c])
				camposPesquisados[c] = query[c];
		if (camposPesquisados.qtdeFiltrosDisponibilidade)
			delete camposPesquisados.qtdeFiltrosDisponibilidade;
		const qtdeCampos = Object.entries(camposPesquisados).length;

		let naoContem = false, exatamente = false;
		if (!query.nomeNoJogo) query.nomeNoJogo = '%';
		else if (!query.opcoesNome) query.nomeNoJogo = '%'+query.nomeNoJogo+'%';
		else if (query.opcoesNome == 'comecaCom') query.nomeNoJogo = query.nomeNoJogo+'%';
		else if (query.opcoesNome == 'terminaCom') query.nomeNoJogo = '%'+query.nomeNoJogo;
		else if (query.opcoesNome == 'exatamente') exatamente = true;
		else if (query.opcoesNome == 'naoContem') {
			naoContem = true;
			query.nomeNoJogo = '%'+query.nomeNoJogo+'%';
		}

		let tempoDeJogoEmMeses;
		let tempoDeJogoEmMeses2;
		let noMaximo = false, entre = false;
		if (query.tempoDeJogoAnos || query.tempoDeJogoMeses)
			tempoDeJogoEmMeses = 0;
		if (query.tempoDeJogoAnos) {
			tempoDeJogoEmMeses += parseInt(query.tempoDeJogoAnos)*12;
		}
		if (query.tempoDeJogoMeses) {
			tempoDeJogoEmMeses += parseInt(query.tempoDeJogoMeses);
		}
		if (query.opcoesTempo) {
			if (query.opcoesTempo == 'noMaximo')
				noMaximo = true;
			else if (query.opcoesTempo == 'entre' && (query.tempoDeJogoAnos2 || query.tempoDeJogoMeses2)) {
				entre = true;
				tempoDeJogoEmMeses2 = 0;
				if (query.tempoDeJogoAnos2)
					tempoDeJogoEmMeses2 += parseInt(query.tempoDeJogoAnos2)*12;
				if (query.tempoDeJogoMeses2)
					tempoDeJogoEmMeses2 += parseInt(query.tempoDeJogoMeses2);
			}
		}
		if((tempoDeJogoEmMeses != undefined && isNaN(tempoDeJogoEmMeses))
		|| (tempoDeJogoEmMeses2 != undefined && isNaN(tempoDeJogoEmMeses2)))
			return {status: 400, erro: 'Tempo de jogo em formato inválido.'};

		let disponivelEmQualquer = false;
		if (query.opcoesDisponibilidade && query.opcoesDisponibilidade == 'emQualquer')
			disponivelEmQualquer = true;

		for (let i = 0; i < query.qtdeFiltrosDisponibilidade; i++) {
			let id = i == 0 ? '' : i+1;
			//formato da hora deve ser 2 números, ':', 2 números, sem caracteres antes nem depois
			if (query['de'+id] && !query['de'+id].match(/^\d{2}:\d{2}$/))
				return {status: 400, erro: 'Horário em formato inválido.'};
			if (query['ate'+id] && !query['ate'+id].match(/^\d{2}:\d{2}$/))
				return {status: 400, erro: 'Horário em formato inválido.'};
			}

		let usaChatDeVoz;
		if (query.usaChatDeVoz) {
			if (query.usaChatDeVoz == 'sim')
				usaChatDeVoz = 1;
			else
				usaChatDeVoz = 0;
		}

		let pagina = 1;
		let resultadosPorPagina = 10;
		if (query.pagina)
			pagina = parseInt(query.pagina);
		if(isNaN(pagina))
			return {status: 400, erro: 'Página em formato inválido.'};
		if (pagina < 1)
			pagina = 1;
		if (query.resultadosPorPagina)
			resultadosPorPagina = parseInt(query.resultadosPorPagina);
		if(isNaN(resultadosPorPagina))
			return {status: 400, erro: 'Resultados por página em formato inválido.'};
		else if (resultadosPorPagina < 3)
			resultadosPorPagina = 3;
		else if (resultadosPorPagina > 100)
			resultadosPorPagina = 100;

		let ordenarPor = 'dataDeCriacao';
		if (query.ordenarPor) {
			if (query.ordenarPor == 'nomeDoJogo')
				ordenarPor = 'nomeUrlDoJogo';
			else if (query.ordenarPor == 'diasQueJoga')
				ordenarPor = 'dias';
			else if (query.ordenarPor == 'nomeNoJogo' || query.ordenarPor == 'tempoDeJogoEmMeses'
			|| query.ordenarPor == 'horaDeInicio' || query.ordenarPor == 'horaDeTermino'
			|| query.ordenarPor == 'usaChatDeVoz')
				ordenarPor = query.ordenarPor;
			else if (query.ordenarPor != 'dataDePublicacao')
				return {status: 400, erro: 'Critério de organização em formato inválido.'};
		}
		let emOrdem = -1;
		if (query.emOrdem) {
			if (query.emOrdem == 'crescente')
				emOrdem = 1;
			else if (query.emOrdem != 'decrescente')
				return {status: 400, erro: 'Ordem de organização em formato inválido.'};
		}

		let sqlDisp2 = [];

		if (query.qtdeFiltrosDisponibilidade) {
			let qualquerDia;
			let diasQueJoga = [];
			const dias = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
			let deHora;
			let ateHora;

			for (let i = 0; i < query.qtdeFiltrosDisponibilidade; i++) {
				qualquerDia = false;
				
				let id = i == 0 ? '' : i+1;
				if (query['quando'+id] == 'qualquerDia')
					qualquerDia = true;
				if (query['quando'+id] == 'todoDia') {
					diasQueJoga = [0,1,2,3,4,5,6];
				} else if (query['quando'+id] == 'semana') {
					diasQueJoga = [1,2,3,4,5];
				} else if (query['quando'+id] == 'finsDeSemana') {
					diasQueJoga = [0,6];
				} else
					dias.some((dia,i)=>{
						if (dia == query['quando'+id]) {
							diasQueJoga = [i];
							return true;
						}
					});

				if (query['de'+id])
					deHora = converterHoraStringParaMinutos(query['de'+id]);
				else
					deHora = undefined;
				if (query['ate'+id])
					ateHora = converterHoraStringParaMinutos(query['ate'+id]);
				else
					ateHora = undefined;

				//////////////////////////////

				let pesqHoraDeInicio = deHora;
				let pesqHoraDeTermino = ateHora;


				//Explicação da query abaixo:
				//-horaDeInicio == horaDeTermino: [jogaDiaTodo] o anunciante joga durante 24h
				//-(horaDeTermino - horaDeInicio + 1440) % 1440: [periodoDisp] valor positivo da qtde de tempo
				//	q o anunciante joga
				//-(pesqHoraDeInicio - horaDeInicio + 1440) % 1440: [difInicio] valor positivo da diferença d tempo
				//	entre o horário de início pesquisado e o q consta no anúncio
				//-(pesqHoraDeTermino - pesqHoraDeInicio + 1440) % 1440: [periodoPesq] valor positivo da qtde de tempo
				//	pesquisada
				//-dias LIKE diasQueJogaString: [diasBatem] os dias q constam na disponibilidade se enquadram na pesquisa
				//Logo, a disponibilidade atual corresponde à pesquisa se:
				// (
				//	jogaDiaTodo
				//	OU
				//	periodoDisp - difInicio >= periodoPesq
				// )
				//E
				// diasBatem (exceto se puder ser qualquer dia)

				const consultaHorario = `(
					hora_de_inicio = hora_de_termino
				OR
					((hora_de_termino - hora_de_inicio + 1440) % 1440)
					- ((${pesqHoraDeInicio == undefined ? 'hora_de_inicio' : pesqHoraDeInicio} - hora_de_inicio + 1440) % 1440)
					>= ((${pesqHoraDeTermino == undefined ? 'hora_de_termino' : pesqHoraDeTermino} - ${pesqHoraDeInicio == undefined ? 'hora_de_inicio' : pesqHoraDeInicio} + 1440) % 1440)
				)`;

				sqlDisp2.push(`anuncio.id IN (
					SELECT id_do_anuncio
					FROM (
						SELECT disponibilidade.id, id_do_anuncio, dia
						FROM disponibilidade JOIN dia_da_disponibilidade
						ON disponibilidade.id = dia_da_disponibilidade.id_da_disponibilidade
						WHERE ${qualquerDia ?
								consultaHorario
							:
								diasQueJoga.map(d=>{
									return (
									'(dia = '+d
									+ ((pesqHoraDeInicio == undefined && pesqHoraDeTermino == undefined) ? '' :
										(' AND ' + consultaHorario))
									+ ')'
								);
							}).join(' OR ')
						}
						GROUP BY id_do_anuncio,dia
					) AS nome_irrelevante
					GROUP BY id_do_anuncio
					HAVING COUNT(id_do_anuncio) >= ${diasQueJoga.length}
				)`);
				
				/*
				select id_anuncio,count(dia) as 'dias' from (select disp_dia.id,id_anuncio,dia FROM disp_dia join disp on disp.id_disp_dia = disp_dia.id
				where (dia = 0 and hora_ini >= 10) or (dia = 1 and hora_ini >= 13) group by id_anuncio,dia) disp_d 
				group by id_anuncio having count(id_anuncio) >= 2;
				--alterar o primeiro 'where'
				--alterar numero depois do 'having' no final pelo count dos dias

				vlw, willameee
				*/

				//////////////////////////////


			}
		}

		//////////////////////////////

		const [jogos] = await pool.query(`SELECT id, nome, nome_url AS nomeUrl FROM jogo;`);

		let jogo;
		if (query.jogo)
			jogo = jogos.find(j=>j.nomeUrl == query.jogo);

		//lembrete: remover idDoUsuario do resultado (vazamento de informação?)
		let sqlAnuncios = `SELECT anuncio.id AS idDoAnuncio
				, id_do_jogo AS idDoJogo, id_do_usuario AS idDoUsuario, nome_no_jogo AS nomeNoJogo,
				tempo_de_jogo_em_meses AS tempoDeJogoEmMeses, usa_chat_de_voz AS usaChatDeVoz, data_de_criacao AS dataDeCriacao
			FROM anuncio
			JOIN disponibilidade ON anuncio.id = disponibilidade.id_do_anuncio
			JOIN dia_da_disponibilidade ON disponibilidade.id = id_da_disponibilidade
			WHERE nome_no_jogo ${exatamente ? '=' : (naoContem ? 'NOT ' : '') + 'LIKE'} (?)
				${idDoUsuario ? `AND id_do_usuario = '${idDoUsuario}'` : ''}
				${jogo ? `AND id_do_jogo = '${jogo.id}'` : ''}
				${tempoDeJogoEmMeses == undefined ? '' :
					`AND tempo_de_jogo_em_meses ${noMaximo ? '<=' : '>='} ${tempoDeJogoEmMeses}`
				}
				${entre ? 'AND tempo_de_jogo_em_meses <=' + tempoDeJogoEmMeses2 : ''}
				${usaChatDeVoz == undefined ? '' : `AND usa_chat_de_voz = ${usaChatDeVoz}`}
				${sqlDisp2.length > 0 ? ' AND (' + sqlDisp2.join(disponivelEmQualquer ? ' OR ' : ' AND ') + ')' : ''}
			GROUP BY anuncio.id
			ORDER BY data_de_criacao DESC;`;

		let [anuncios] = await pool.query(sqlAnuncios, [query.nomeNoJogo]);
		const idsDosAnuncios = "'" + anuncios.map(an=>an.idDoAnuncio).join("','") + "'";
		const [disponibilidades] = await pool.query(
			`SELECT id, id_do_anuncio AS idDoAnuncio, hora_de_inicio AS horaDeInicio, hora_de_termino AS horaDeTermino
			FROM disponibilidade
			WHERE id_do_anuncio IN (${idsDosAnuncios});`
		);
		const idsDasDisponibilidades = disponibilidades.length == 0 ? 'NULL' : disponibilidades.map(disp=>disp.id).join();
		const [diasDasDisponibilidades] = await pool.query(
			`SELECT id_da_disponibilidade AS idDaDisponibilidade, dia
			FROM dia_da_disponibilidade
			WHERE id_da_disponibilidade IN (${idsDasDisponibilidades});`
		);
		disponibilidades.map(disp=>{
			disp.dias = diasDasDisponibilidades.filter(d=>d.idDaDisponibilidade == disp.id).map(d=>d.dia);
		});

		anuncios.map(an=>{
			jogos.some(j=>{
				if (j.id == an.idDoJogo) {
					an.nomeDoJogo = j.nome;
					an.nomeUrlDoJogo = j.nomeUrl;
					return true;
				}
			});
			an.disponibilidades = disponibilidades.filter(disp=>disp.idDoAnuncio == an.idDoAnuncio);
		});

		anuncios.map(an=>{
			an.disponibilidades.map(disp=>{
				delete disp.idDoAnuncio;
				disp.horaDeInicio = converterMinutosParaHoraString(disp.horaDeInicio);
				disp.horaDeTermino = converterMinutosParaHoraString(disp.horaDeTermino);
			});
		});

		if (ordenarPor == 'dias'){
			anuncios.sort((a,b)=>
				a.disponibilidades[0][ordenarPor].localeCompare(b.disponibilidades[0][ordenarPor].search())
			);
		} else if (ordenarPor == 'horaDeInicio' || ordenarPor == 'horaDeTermino'){
			anuncios.sort((a,b)=>a.disponibilidades[0][ordenarPor] - b.disponibilidades[0][ordenarPor]);
		} else if (ordenarPor == 'nomeUrlDoJogo' || ordenarPor == 'nomeNoJogo'){
			anuncios.sort((a,b)=>a[ordenarPor].toLowerCase().localeCompare(b[ordenarPor].toLowerCase()));
		} else {
			anuncios.sort((a,b)=>a[ordenarPor] - b[ordenarPor]);
		}

		if(emOrdem < 0)
			anuncios.reverse();


		//////////////////////////////

		const totalDeAnuncios = anuncios.length;
		const totalDePaginas = Math.ceil(totalDeAnuncios / resultadosPorPagina);
		
		if (pagina > totalDePaginas)
			pagina = totalDePaginas;
		const anunciosDaPagina = anuncios.filter((a,i)=>
			i >= (pagina-1)*resultadosPorPagina && i < pagina*resultadosPorPagina
		);
		console.log('qtde campos='+qtdeCampos+', qtde resultados='+anuncios.length);
		return {anuncios: anunciosDaPagina, totalDeAnuncios, pagina, totalDePaginas, resultadosPorPagina};
	}
	catch (erro) {
		console.log(erro);
		return {status: 500, erro: 'Erro interno no servidor.'};
	}
}

//página anúncios
servidor.get('/anuncios', async (req, resp)=>{
	console.log('GET anuncios, ip='+req.ip);
	const anuncios = await pesquisar(req.query);
	if (anuncios.erro)
		return resp.status(anuncios.status).json({erro: anuncios.erro});
	return resp.status(200).json(anuncios);
});

//página meus anúncios
servidor.get('/usuarios/:idDoUsuario/anuncios', async (req, resp)=>{
	console.log('GET usuarios/:idDoUsuario/anuncios, id='+req.params.idDoUsuario+', ip='+req.ip);
	const sessaoExiste = await autenticarSessao(req.get('Authorization'));
	if (sessaoExiste.erro)
		return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
	if (sessaoExiste.idDoUsuario != req.params.idDoUsuario) //lembrete: é possível isso?
		return resp.status(409).json({erro: 'O token não pertence ao usuário informado.', codigo: 409});
	const anuncios = await pesquisar(req.query, req.params.idDoUsuario);
	if (anuncios.erro)
		return resp.status(anuncios.status).json({erro: anuncios.erro});
	return resp.status(200).json(anuncios);
});

//retorna o discord do anúncio do id informado (chamado no modal conectar, nos cartões de anúncios)
//lembrete: mudar pra autenticar ants d retornar
servidor.get('/anuncios/:idDoAnuncio/discord', async (req, resp)=>{
	try {
		const idDoAnuncio = req.params.idDoAnuncio;
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		const [[anuncioExiste]] = await pool.query(`SELECT discord FROM anuncio WHERE id = '${idDoAnuncio}';`);
		if (!anuncioExiste) {
			console.log('Anúncio não encontrado.');
			return resp.status(404).json({erro: 'Anúncio não encontrado.'});
		}
		console.log('GET anuncios/:idDoAnuncio/discord, discord='+anuncioExiste.discord+', ip='+req.ip);
		return resp.status(200).json({discord: anuncioExiste.discord});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//exclui um anúncio
servidor.delete('/anuncios/:idDoAnuncio', async (req, resp)=>{
	try {
		const idDoAnuncio = req.params.idDoAnuncio;
		console.log('DELETE anuncios/:idDoAnuncio, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		
		const [[anuncioExiste]] = await pool.query(
			`SELECT id, id_do_usuario AS idDoUsuario FROM anuncio WHERE id = '${idDoAnuncio}';`
		);
		const [disponibilidadesExistem] = await pool.query(
			`SELECT id, id_do_anuncio FROM disponibilidade WHERE id_do_anuncio = '${idDoAnuncio}';`
		);
		const idsDasDisponibilidades = disponibilidadesExistem.map(d=>d.id).join();
		const [diasExistem] = await pool.query(
			`SELECT id FROM dia_da_disponibilidade
			WHERE id_da_disponibilidade IN (${idsDasDisponibilidades});`
		);

		if (!anuncioExiste && disponibilidadesExistem.length == 0 && diasExistem.length == 0) {
			console.log('Anúncio não encontrado.');
			return resp.status(404).json({erro: 'Anúncio não encontrado.'});
		}
		if (sessaoExiste.idDoUsuario != anuncioExiste.idDoUsuario)
			return resp.status(409).json({erro: 'O anúncio não pertence ao usuário informado.', codigo: 409});

		await pool.query(`DELETE FROM anuncio WHERE id = '${idDoAnuncio}';`);
		await pool.query(`DELETE FROM disponibilidade WHERE id_do_anuncio = '${idDoAnuncio}';`);
		await pool.query(
			`DELETE FROM dia_da_disponibilidade WHERE id_da_disponibilidade IN (${idsDasDisponibilidades});`
		);

		console.log('Anúncio excluído.');
		return resp.status(200).json({ok: 'Anúncio excluído.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//cadastra usuário
servidor.post('/usuarios', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST usuarios, usuário='+body.nomeDoUsuario+', ip='+req.ip);
    if (!body.nomeDoUsuario){
			console.log('Digite um nome de usuário.');
			return resp.status(422).json({erro: 'Digite um nome de usuário.'});
		}
    if (!body.senha){
			console.log('Digite uma senha.');
			return resp.status(422).json({erro: 'Digite uma senha.'});
		}
    if (!body.email){
			console.log('Digite um e-mail.');
			return resp.status(422).json({erro: 'Digite um e-mail.'});
		}
    if (body.email && !body.email.match(
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
		)) {
			console.log('Formato de e-mail inválido.');
			return resp.status(422).json({erro: 'Formato de e-mail inválido.'});
		}
		const [[usuarioJaExiste]] = await pool.query(
			`SELECT id FROM usuario WHERE nome_de_usuario = (?);`,
			[body.nomeDoUsuario]
		);
		if (usuarioJaExiste) {
			console.log('Nome de usuário não disponível.');
			return resp.status(422).json({erro: 'Nome de usuário não disponível.'});
		}
		const senhaHash = await bcrypt.hash(body.senha, BCRYPT_SALT_ROUNDS);
		const usuarioRegistrado = {};
		usuarioRegistrado.id = uuidv4();
		await pool.query(`INSERT INTO usuario (id, nome_de_usuario, hash_da_senha, email) VALUES (?,?,?,?);`,
			[usuarioRegistrado.id, body.nomeDoUsuario, senhaHash, body.email]
		);
		usuarioRegistrado.nome = body.nomeDoUsuario;

		console.log('Usuário registrado, id='+usuarioRegistrado.id+'.');
		return resp.status(201).json(usuarioRegistrado);
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//retorna dados pessoais do usuário
servidor.get('/usuarios/:idDoUsuario/dados', async (req, resp)=>{
	try {
		const idDoUsuario = req.params.idDoUsuario;
		console.log('GET usuarios/:idDoUsuario/dados='+idDoUsuario+', ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		if (sessaoExiste.idDoUsuario != idDoUsuario) //lembrete: é possível isso?
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.', codigo: 409});
		const [[usuario]] = await pool.query(
			`SELECT nome_de_usuario AS nome, email FROM usuario WHERE id = '${idDoUsuario}';`
		);
		return resp.status(200).json(usuario);
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});
	
//altera dados do usuário
servidor.put('/usuarios/:idDoUsuario', async (req, resp)=>{
	try {
		const body = req.body;
		const idDoUsuario = req.params.idDoUsuario;
		console.log('PUT usuarios/:idDoUsuario='+idDoUsuario+', ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		if (sessaoExiste.idDoUsuario != idDoUsuario) //lembrete: é possível isso?
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.', codigo: 409});
		const usuarioExiste = await verificarCredenciais('', body.senha, sessaoExiste.idDoUsuario);
		if (usuarioExiste.erro)
			return resp.status(usuarioExiste.status).json({erro: usuarioExiste.erro});
		if (body.email) {
			if (!body.email.match(
				/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
			)) {
				console.log('E-mail em formato inválido.');
				return resp.status(400).json({erro: 'E-mail em formato inválido.'});
			}
			await pool.query(`UPDATE usuario SET email = '${body.email}' WHERE id = '${sessaoExiste.idDoUsuario}';`);
		}
		if (body.novaSenha) {
			const novaSenhaIgual = await bcrypt.compare(body.novaSenha, usuarioExiste.senhaHash);
			if (novaSenhaIgual) {
				console.log('A nova senha não pode ser igual à atual.');
				return resp.status(422).json({erro: 'A nova senha não pode ser igual à atual.'});
			}
			const novaSenhaHash = await bcrypt.hash(body.novaSenha, BCRYPT_SALT_ROUNDS);
			await pool.query(
				`UPDATE usuario SET hash_da_senha = '${novaSenhaHash}' WHERE id = '${sessaoExiste.idDoUsuario}';`
			);
		}
		await pool.query(
			`DELETE FROM sessao
			WHERE id_do_usuario = '${sessaoExiste.idDoUsuario}' AND seletor != '${sessaoExiste.seletor}';`
		);
		console.log('Dados alterados com sucesso.');
		const [[{email}]] = await pool.query(`SELECT email FROM usuario WHERE id = '${sessaoExiste.idDoUsuario}';`);
		return resp.status(200).json({ok: 'Dados alterados com sucesso.', email: email});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//inicia processo de requisição de redefinição de senha
servidor.post('/recuperacao-de-conta', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST recuperacao-de-conta, ip='+req.ip);
		const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE email = (?);`, [body.email]);
		if (!usuarioExiste) {
			console.log('Conta não encontrada.');
			return resp.status(404).json({erro: 'Conta não encontrada.'});
		}
		//remove requisições anteriores, caso haja
		await pool.query(`DELETE FROM recuperacao_de_conta WHERE id_do_usuario = '${usuarioExiste.id}';`);
		const uuidDoToken = uuidv4();
		const uuidDoTokenHash = await bcrypt.hash(uuidDoToken, BCRYPT_SALT_ROUNDS);
		await pool.query(
			`INSERT INTO recuperacao_de_conta (id, id_do_usuario, hash_do_token)
			VALUES ('${uuidDoToken}', '${usuarioExiste.id}', '${uuidDoTokenHash}');`
		);
		const emailEnviado = await enviarEmail(body.email, 'Redefinição de senha',
			`<p>Clique no link abaixo para ir para a página de redefinição de senha:</p>
			<a href='${process.env.ENDERECO_DA_PAGINA}/redefinir-senha?token=${uuidDoToken}&id=${usuarioExiste.id}'>
				Redefinir senha
			</a>
			<br>
			<p>Ou copie e cole o endereço abaixo em seu navegador:</p>
			<p>${process.env.ENDERECO_DA_PAGINA}/redefinir-senha?token=${uuidDoToken}&id=${usuarioExiste.id}</p>`
		);
		if (emailEnviado.erro)
			return resp.status(emailEnviado.status).json({erro: emailEnviado.erro});
		return resp.status(200).json({ok: 'E-mail enviado com sucesso.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

async function enviarEmail(email, assunto, texto) {
	try {
		const accessToken = await oAuth2Client.getAccessToken();
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL,
				type: 'OAuth2',
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
				accessToken: accessToken
			},
				// tls: {
				// 	// secureProtocol: 'TLSv1_method',
				// 	rejectUnauthorized: false,
				// },
		});
		// const transporter = nodemailer.createTransport({
		// 	host: 'sandbox.smtp.mailtrap.io',
		// 	port: 587,
		// 	auth: {
		// 		user: '2532e002f2d871',
		// 		pass: '1d9fa7da00c108',
		// 	},
		// 	// secureConnection: true,
		// 	tls: {
		// 		// secureProtocol: 'TLSv1_method',
		// 		rejectUnauthorized: false,
		// 	},
		// });
		//transporter.verify(function(error, success) {
		//	if (error) {
		//		console.log(error);
		//	} else {
		//		console.log('Server is ready to take our messages');
		//	}
		//});
		await transporter.sendMail({
			from: process.env.EMAIL,
			to: email,
			subject: assunto,
			text: texto,
			html: texto
		});
		console.log('E-mail enviado com sucesso.');
		return {enviado: true};
	} catch (erro) {
		console.log('Erro ao enviar e-mail:');
		console.log(erro);
		return {status: 500, erro};
	}
}

//lembrete
async function validarRecuperacaoDeConta() {
	const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE id = (?);`, [query.id]);
	if (!usuarioExiste) {
		console.log('Conta não encontrada.');
		return resp.status(404).json({erro: 'Conta não encontrada.'});
	}
	const [[recuperacaoExiste]] = await pool.query(
		`SELECT hash_do_token AS tokenDaSessaoHash, UNIX_TIMESTAMP(data_de_criacao) AS dataDeCriacaoEmSeg
		FROM recuperacao_de_conta
		WHERE id_do_usuario = (?);`, [query.id]
	);
	if (!recuperacaoExiste) {
		console.log('Redefinição de senha inexistente.');
		return resp.status(401).json({erro: 'Redefinição de senha inexistente.'});
	}
	//lembrete: renomear token aki
	const recuperacaoValida = await bcrypt.compare(query.token, recuperacaoExiste.tokenDaSessaoHash);
	if (!recuperacaoValida) {
		console.log('Redefinição inválida.');
		return resp.status(401).json({erro: 'Redefinição de senha inválida.'});
	}
	if(recuperacaoExiste.dataDeCriacaoEmSeg*1000 + DURACAO_DO_TOKEN_DE_RECUPERACAO < Date.now()) {
		console.log('Redefinição de senha expirada.');
		return resp.status(401).json({erro: 'Redefinição de senha expirada.'});
	}
	return {ok: true};
}

servidor.get('/recuperacao-de-conta', async (req, resp)=>{
	try {
		const query = req.query;
		console.log('GET recuperacao-de-conta, ip='+req.ip);
		const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE id = (?);`, [query.id]);
		if (!usuarioExiste) {
			console.log('Conta não encontrada.');
			return resp.status(404).json({erro: 'Conta não encontrada.'});
		}
		const [[recuperacaoExiste]] = await pool.query(
			`SELECT hash_do_token AS tokenDaSessaoHash, UNIX_TIMESTAMP(data_de_criacao) AS dataDeCriacaoEmSeg
			FROM recuperacao_de_conta
			WHERE id_do_usuario = (?);`, [query.id]
		);
		if (!recuperacaoExiste) {
			console.log('Redefinição de senha inexistente.');
			return resp.status(401).json({erro: 'Redefinição de senha inexistente.'});
		}
		//lembrete: renomear token aki
		const recuperacaoValida = await bcrypt.compare(query.token, recuperacaoExiste.tokenDaSessaoHash);
		if (!recuperacaoValida) {
			console.log('Redefinição inválida.');
			return resp.status(401).json({erro: 'Redefinição de senha inválida.'});
		}
		if(recuperacaoExiste.dataDeCriacaoEmSeg*1000 + DURACAO_DO_TOKEN_DE_RECUPERACAO < Date.now()) {
			console.log('Redefinição de senha expirada.');
			return resp.status(401).json({erro: 'Redefinição de senha expirada.'});
		}
		return resp.status(200).json({ok: true});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
})

servidor.post('/redefinicao-de-senha', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST redefinicao-de-senha, ip='+req.ip);
		const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE id = (?);`, [body.idDoUsuario]);
		if (!usuarioExiste) {
			console.log('Conta não encontrada.');
			return resp.status(404).json({erro: 'Conta não encontrada.'});
		}
		const [[recuperacaoExiste]] = await pool.query(
			`SELECT hash_do_token AS tokenDaSessaoHash, UNIX_TIMESTAMP(data_de_criacao) AS dataDeCriacaoEmSeg
			FROM recuperacao_de_conta
			WHERE id_do_usuario = (?);`, [body.idDoUsuario]
		);
		if (!recuperacaoExiste) {
			console.log('Redefinição de senha inexistente.');
			return resp.status(401).json({erro: 'Redefinição de senha inexistente.'});
		}
		//lembrete: renomear token aki
		const recuperacaoValida = await bcrypt.compare(body.token, recuperacaoExiste.tokenDaSessaoHash);
		if (!recuperacaoValida) {
			console.log('Redefinição inválida.');
			return resp.status(401).json({erro: 'Redefinição de senha inválida.'});
		}
		if(recuperacaoExiste.dataDeCriacaoEmSeg*1000 + DURACAO_DO_TOKEN_DE_RECUPERACAO < Date.now()) {
			console.log('Redefinição de senha expirada.');
			return resp.status(401).json({erro: 'Redefinição de senha expirada.'});
		}

		const novaSenhaHash = await bcrypt.hash(body.novaSenha, BCRYPT_SALT_ROUNDS);
		await pool.query(`UPDATE usuario SET hash_da_senha = '${novaSenhaHash}' WHERE id = '${body.idDoUsuario}';`);
		await pool.query(`DELETE FROM recuperacao_de_conta WHERE id_do_usuario = '${body.idDoUsuario}';`);
		return resp.status(200).json({ok: 'Senha redefinida com sucesso.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//exclui conta de usuário
servidor.delete('/usuarios/:idDoUsuario', async (req, resp)=>{
	try {
		const body = req.body;
		const idDoUsuario = req.params.idDoUsuario;
		console.log('DELETE usuarios/:idDoUsuario, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		if (sessaoExiste.idDoUsuario != idDoUsuario) //lembrete: é possível isso?
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.', codigo: 409});
		const usuarioExiste = await verificarCredenciais('', body.senha, sessaoExiste.idDoUsuario);
		if (usuarioExiste.erro)
			return resp.status(usuarioExiste.status).json({erro: usuarioExiste.erro});

		//todos os dados relacionados ao usuário estão referenciados por chave estrangeira, logo, basta excluí-lo
		await pool.query(`DELETE FROM usuario WHERE id = '${sessaoExiste.idDoUsuario}';`);

		console.log('Conta excluída, id='+sessaoExiste.idDoUsuario+'.');
		return resp.status(200).json({ok: 'Conta excluída.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

async function autenticarSessao(token){
	try {
		const seletor = token.slice(0,8);
		const uuidDoToken = token.slice(9);
		//lembrete: renomear token aki
		const [[sessaoExiste]] = await pool.query(
		`SELECT sessao.id, id_do_usuario AS idDoUsuario, hash_do_token AS tokenDaSessaoHash,
			UNIX_TIMESTAMP(sessao.data_de_criacao) AS dataDeCriacaoEmSeg, manter_sessao AS manterSessao,
			usuario.nome_de_usuario AS nomeDoUsuario
		FROM sessao JOIN usuario
		ON sessao.id_do_usuario = usuario.id
		WHERE seletor = '${seletor}';`
	);
		if (!sessaoExiste) {
			console.log('Sessão não encontrada.');
			return {status: 401, erro: {descricao: 'Sessão não encontrada.', codigo: 401}};
		}
		if(sessaoExiste.dataDeCriacaoEmSeg*1000 + DURACAO_DO_TOKEN_DE_SESSAO < Date.now()) {
			console.log('Sessão expirada.');
			return {status: 401, erro: {descricao: 'Sessão expirada.', codigo: 401}};
		}
		//lembrete: renomear token aki
		const sessaoValida = await bcrypt.compare(uuidDoToken, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return {status: 401, erro: {descricao: 'Sessão inválida.', codigo: 401}};
			//cookie roubado? oq deve ser feito nesse caso?
		}
		return {
			id: sessaoExiste.id,
			seletor: seletor,
			idDoUsuario: sessaoExiste.idDoUsuario,
			nomeDoUsuario: sessaoExiste.nomeDoUsuario,
			manterSessao: sessaoExiste.manterSessao
		};
	} catch (erro) {
		console.log(erro);
		return {status: 500, erro: 'Erro interno no servidor.'};
	}
}

/*async function atualizarSessao(idDaSessao){
	console.log('entrou em atualizarSessao');
	try {
		const novoTokenDaSessao = uuidv4();
		const novoTokenDaSessaoHash = await bcrypt.hash(novoTokenDaSessao, BCRYPT_SALT_ROUNDS);
		const dataDeExpiracao = Date.now() + DURACAO_DO_TOKEN_DE_SESSAO;
		const db = await abrirBanco;
		await db.run(`
			UPDATE Sessoes
			SET tokenDaSessaoHash = '${novoTokenDaSessaoHash}', dataDeExpiracao = ${dataDeExpiracao}
			WHERE id = ${idDaSessao};`,
			//[tokenDaNovaSessaoHash, daquiAUmMes],
		//const token = {id: usuarioExiste.id, nome: usuarioExiste.nome, token: uuidv4()};
		//await db.run(`INSERT INTO Sessoes (id, nome, token) VALUES (?,?,?);`,
		//	[token.id, token.nome, token.token],
			function(erro) {
				console.log('quando isso é executado??');
				if (erro) {
					console.log('erro:');
					console.log(erro);
					return console.log(erro);
				}
				console.log(`A row has been inserted with rowid ${this.lastID}`);
				return this.lastID;
			}
		);
		return {
			novoTokenDaSessao,
			dataDeExpiracao
		};
	} catch (erro) {
		console.log('entrou no catch de atualizarSessao');
		console.log(erro);
		return {erro};
	}
}*/

async function verificarCredenciais(nome, senha, id) {
	try {
		let info = id ? id : nome;
		const [[usuario]] = await pool.query(
			`SELECT id, nome_de_usuario AS nome, hash_da_senha AS senhaHash FROM usuario
			WHERE ${id ? 'id' : 'nome_de_usuario'} = (?);`, [info]
		);

		if (!usuario) {
			console.log('Usuário não registrado.');
			return {status: 404, erro: 'Usuário não registrado.'};
		}
		const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
		if (!senhaCorreta) {
			console.log('Senha incorreta.');
			return {status: 200, erro: 'Senha incorreta.'}; //200 pq n houve erro na requisição
		}
		return usuario;
	} catch (erro) {
		console.log(erro);
		return {status: 500, erro: 'Erro interno no servidor.'};
	}
}

//inicia uma nova sessão e retorna um token de autenticação
servidor.post('/sessoes', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST sessoes, usuário='+body.nomeDoUsuario+', manter sessão='+body.manterSessao
			+', ip='+req.ip);
		if (body.manterSessao !== true) body.manterSessao = 'false';
		const usuarioExiste = await verificarCredenciais(body.nomeDoUsuario, body.senha);
		if (usuarioExiste.erro)
			return resp.status(usuarioExiste.status).json({erro: usuarioExiste.erro});

		const seletor = crypto.randomBytes(4).toString('hex');
		const uuidDoToken = uuidv4();
		const resposta = {
			id: usuarioExiste.id,
			nome: usuarioExiste.nome,
			tokenDaSessao: seletor + '-' + uuidDoToken,
			token: seletor + '-' + uuidDoToken,
			dataDeExpiracao: Date.now() + DURACAO_DO_TOKEN_DE_SESSAO,
			manterSessao: body.manterSessao
		};
		const uuidDoTokenHash = await bcrypt.hash(uuidDoToken, BCRYPT_SALT_ROUNDS);

		await pool.query(//renomear token aki
			`INSERT INTO sessao (id, id_do_usuario, seletor, hash_do_token, manter_sessao, data_de_expiracao)
			VALUES ('${uuidDoToken}', '${resposta.id}', '${seletor}', '${uuidDoTokenHash}', ${resposta.manterSessao},
			FROM_UNIXTIME(${resposta.dataDeExpiracao/1000}));`
		);
		console.log('Sessão criada.');
		return resp.status(201).json(resposta);
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//chamado ao carregar a página; autentica sessão e atualiza a data de expiração
servidor.put('/sessoes', async (req, resp)=>{
	try {
		console.log('PUT sessoes, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		//sem atualizar token:
		const resposta = {
			id: sessaoExiste.id,
			idDoUsuario: sessaoExiste.idDoUsuario,
			nome: sessaoExiste.nomeDoUsuario,
			tokenDaSessao: req.get('Authorization'),
			token: req.get('Authorization'),
			dataDeExpiracao: Date.now() + DURACAO_DO_TOKEN_DE_SESSAO,
			manterSessao: sessaoExiste.manterSessao
		};
		await pool.query(
			`UPDATE sessao SET data_de_expiracao = FROM_UNIXTIME(${resposta.dataDeExpiracao/1000})
			WHERE id = '${sessaoExiste.id}';`
		);
		console.log('Sessão autenticada e atualizada.');
		return resp.status(200).json(resposta);
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//chamado ao deslogar; exclui a sessão do dispositivo atual
servidor.delete('/sessoes', async (req, resp)=>{
	try {
		console.log('DELETE sessoes, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		await pool.query(`DELETE FROM sessao WHERE id = '${sessaoExiste.id}';`);
		console.log('Sessão excluída.');
		return resp.status(200).json({ok: 'Sessão excluída.'});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//exclui todas as outras sessões do mesmo usuário e retorna o número de sessões excluídas
//lembrete: criar rota que retorna informações dos outros dispositivos conectados
servidor.delete('/usuarios/:idDoUsuario/outras-sessoes', async (req, resp)=>{
	try {
		const idDoUsuario = req.params.idDoUsuario;
		console.log('DELETE outras-sessoes/:idDoUsuario, id do usuário='+idDoUsuario+', ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		const [[sessoesConectadas]] = await pool.query(
			`SELECT COUNT(*) AS qtde FROM sessao
			WHERE id_do_usuario = '${idDoUsuario}' AND seletor != '${sessaoExiste.seletor}'
			AND data_de_expiracao > FROM_UNIXTIME(${Date.now()/1000});`
		);
		await pool.query(`DELETE FROM sessao WHERE id_do_usuario = '${idDoUsuario}' AND seletor != '${sessaoExiste.seletor}';`);
		console.log('Sessões desconectadas='+sessoesConectadas.qtde+'.');
		return resp.status(200).json({qtdeSessoesDesconectadas: sessoesConectadas.qtde});
	}
	catch (erro) {
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

servidor.listen(process.env.PORTA_DO_SERVIDOR, ()=>console.log('iniciou server, ouvindo porta '+process.env.PORTA_DO_SERVIDOR));