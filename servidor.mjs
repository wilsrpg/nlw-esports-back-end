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

/*lembrete: ajeitar no front-end:
-deletei último anúncio e continuou dizendo q tinha 1 anúncio encontrado
-alterei senha e o email na caixa d texto foi apagado
*/

const servidor = express();
servidor.use(express.json());
servidor.use(cors({
	//origin: 'http://meudominio.com'
}));

dotenvConfig();

//const abrirBanco = open({
//	filename: '../db/db.sqlite',
//	driver: sqlite3.Database
//});

//const con = mysql.createConnection({
//	host: 'johnny.heliohost.org',
//	port: '3306',
//	database: 'wilsrpg_heliodb',
//	user: 'wilsrpg_helio',
//	password: process.env.SENHA_DO_DB
//});

const pool = mysql.createPool({
	host: 'johnny.heliohost.org',
	port: '3306',
	database: 'wilsrpg_heliodb',
	user: 'wilsrpg_helio',
	password: process.env.SENHA_DO_DB
}).promise();

//const poolp2 = await mysqlp.createPool({
//	host: 'johnny.heliohost.org',
//	port: '3306',
//	database: 'wilsrpg_heliodb',
//	user: 'wilsrpg_helio',
//	password: process.env.SENHA_DO_DB,
//  waitForConnections: true,
//  connectionLimit: 10,
//  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
//  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
//  queueLimit: 0,
//  enableKeepAlive: true,
//  keepAliveInitialDelay: 0,
//});

const BCRYPT_SALT_ROUNDS = 10;

const DURACAO_DO_TOKEN_DE_SESSAO = 7 * 24*60*60*1000; //uma semana
const DURACAO_DO_TOKEN_DE_RECUPERACAO = 10*60*1000; //10 minutos

//procedimentos iniciais
async function iniciar() {

  //console.log('tentando conexão');
  //const desconectado = await new Promise(resolve=>{
  //  con.ping(erro=>resolve(erro));
  //});
  //console.log('concluído. estado:');
  //console.log(desconectado);
  //if(desconectado)
	//	console.log('desconectado');
	//else {
	//	console.log('conectado');
	//	//await pool.query(`SHOW DATABASES LIKE '%';`);
	//	await pool.query(`SHOW SCHEMAS;`);
	//	console.log('blz');
	//	//await pool.query('CREATE DATABASE IF NOT EXISTS dbteste;');
	//}

	//const [a] = await pool.query(`SELECT * FROM todos;`);
	//console.log(a);

	//con.connect((err) => {
		//if (err) return console.error(err.message);
		//console.log('con conectou ao banco de dados');

		// const createTodosTable = `create table if not exists todos(
		// 	id int primary key auto_increment,
		// 	title varchar(255) not null,
		// 	completed bool not null default false
		// );`;

		//const selectTodos = 'select * from todos;';
		//const insertTodos = 'insert into todos(title) values ?;';
		//const todos = [
		//	['teste1'],['teste2'],['teste3']
		//];
		//const deleteTodo = 'delete from todos where title = "teste3";';

		//con.query(insertTodos, [todos], (err, results, fields) => {
		//	if (err) return console.error(err.message);
		//	console.log('Inserted rows: ' + results.affectedRows);
		//});

		//con.query(deleteTodo, (err, results, fields) => {
		//	if (err) return console.log(err.message);
		//	return console.log(results);
		//});

		//con.query(selectTodos, (err, results, fields) => {
		//	if (err) return console.log(err.message);
		//	return console.log(results);
		//});

		//const res = await pool.query('INSERT INTO todos(title) VALUES ("testando");');
		//console.log(res);


		//criação das tabelas

		//con.query(`CREATE TABLE IF NOT EXISTS jogo (
		//	id CHAR(36) PRIMARY KEY,
		//	nome VARCHAR(255) NOT NULL,
		//	nome_url VARCHAR(255) NOT NULL,
		//	url_da_imagem VARCHAR(255) NOT NULL
		//);`
		//);

		//con.query(`CREATE TABLE IF NOT EXISTS usuario (
		//	id CHAR(36) PRIMARY KEY,
		//	nome_de_usuario VARCHAR(255) NOT NULL UNIQUE,
		//	nome_de_exibicao VARCHAR(255) NOT NULL,
		//	email VARCHAR(255) NOT NULL UNIQUE,
		//	hash_da_senha CHAR(60) NOT NULL,
		//	timestamp_da_criacao_em_ms BIGINT NOT NULL,
		//	data_de_criacao DATETIME NOT NULL
		//);`
		//);

		//con.query(`CREATE TABLE IF NOT EXISTS sessao (
		//	id CHAR(36) PRIMARY KEY,
		//	id_do_usuario CHAR(36) NOT NULL,
		//	seletor CHAR(8) NOT NULL,
		//	hash_do_token CHAR(60) NOT NULL,
		//	manter_sessao BOOLEAN NOT NULL,
		//	data_de_criacao DATETIME NOT NULL,
		//	FOREIGN KEY (id_do_usuario) REFERENCES usuario (id)
		//	ON DELETE CASCADE
		//);`
		//);

		//con.query(`CREATE TABLE IF NOT EXISTS recuperacao_de_conta (
		//	id CHAR(36) PRIMARY KEY,
		//	id_do_usuario CHAR(36) NOT NULL,
		//	hash_do_token CHAR(60) NOT NULL,
		//	data_de_criacao DATETIME NOT NULL,
		//	FOREIGN KEY (id_do_usuario) REFERENCES usuario (id)
		//	ON DELETE CASCADE
		//);`
		//);

		//con.query(`CREATE TABLE IF NOT EXISTS anuncio (
		//	id CHAR(36) PRIMARY KEY,
		//	id_do_jogo CHAR(36) NOT NULL,
		//	id_do_usuario CHAR(36) NOT NULL,
		//	nome_no_jogo VARCHAR(255) NOT NULL,
		//	tempo_de_jogo_em_meses INT NOT NULL,
		//	discord VARCHAR(255) NOT NULL,
		//	usa_chat_de_voz BOOLEAN NOT NULL,
		//	timestamp_da_criacao_em_ms BIGINT NOT NULL,
		//	data_de_criacao DATETIME NOT NULL,
		//	FOREIGN KEY (id_do_usuario) REFERENCES usuario (id)
		//	ON DELETE CASCADE
		//);`
		//);

		//con.query(
		//	`CREATE TABLE IF NOT EXISTS disponibilidade (
		//		id INT AUTO_INCREMENT PRIMARY KEY,
		//		id_do_anuncio CHAR(36) NOT NULL,
		//		hora_de_inicio INT NOT NULL,
		//		hora_de_termino INT NOT NULL,
		//		FOREIGN KEY (id_do_anuncio) REFERENCES anuncio (id)
		//		ON DELETE CASCADE
		//	);`
		//);

		//con.query(`CREATE TABLE IF NOT EXISTS dia_da_disponibilidade (
		//	id INT AUTO_INCREMENT PRIMARY KEY,
		//	id_da_disponibilidade INT NOT NULL,
		//	dia INT NOT NULL,
		//	FOREIGN KEY (id_da_disponibilidade) REFERENCES disponibilidade (id)
		//	ON DELETE CASCADE
		//);`
		//);


		// close the connection
		//con.end((err) => {
		//	if (err) return console.log(err.message);
		//});
	//});


	//const db = await abrirBanco;
	//const jogos = await db.all(`SELECT * FROM Jogos;`);
	//const usuarios = await db.all(`SELECT * FROM Usuarios;`);
	//const anuncios = await db.all(`SELECT * FROM Anuncios;`);
	//const disponibilidades = await db.all(`SELECT * FROM Disponibilidades;`);
	//const diasDasDisponibilidades = await db.all(`SELECT * FROM DiasDasDisponibilidades;`);

	////await pool.query(`DELETE FROM usuario;`);
	//const [usuarios2] = await pool.query(`SELECT * FROM usuario;`);
	//console.log(usuarios2.filter((a,i)=>i<5));
	////await pool.query(`DELETE FROM disponibilidade;`);
	//console.log('deletou disponibilidade');
	////await pool.query(`DELETE FROM dia_da_disponibilidade;`);
	//console.log('deletou dia_da_disponibilidade');
	//const [anuncios2] = await pool.query(`SELECT * FROM anuncio;`);

	//console.log(jogos);

	//usuarios.map((usuario,i)=>{
	//	//usuario.uuid = uuidv4();
	//	usuarios2.some(usuario2=>{
	//		if (usuario2.nome_de_usuario == usuario.nome)
	//			usuario.uuid = usuario2.id;
	//	})
	//	if (!usuario.email)
	//		usuario.email = 'email'+i+'@vaz.io';
	//	usuario.dataDeCriacaoEmSeg = parseInt(usuario.dataDeCriacao/1000);
	//});
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
	//console.log(anuncios.filter((a,i)=>i<5));

	//anuncios.map(anuncio=>{
	//	if (!anuncio.uuid)
	//		//anuncio.uuid = uuidv4();
	//		anuncios2.some(anuncio2=>{
	//			if (anuncio2.timestamp_da_criacao_em_ms == anuncio.dataDeCriacao)
	//				anuncio.uuid = anuncio2.id;
	//		})
	//});

	//disponibilidades.map(disp=>{
	//	anuncios.some(anuncio=>{
	//		if (anuncio.idDoAnuncio == disp.idDoAnuncio)
	//			disp.uuidDoAnuncio = anuncio.uuid;
	//	})
	//	//anuncios2.some(anuncio2=>{
	//	//	if (anuncio2.idDoAnuncio == disp.idDoAnuncio)
	//	//		disp.uuidDoAnuncio = anuncio2.uuid;
	//	//})
	//});
	//console.log(disponibilidades.filter((a,i)=>i<5));

	//console.log(diasDasDisponibilidades.filter((a,i)=>i<5));


	//importação dos dados
	//let i = 0;
	//console.log('importando...');

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

	//i = 0;
	//while (i < usuarios.length) {
	//	await pool.query(
	//		`INSERT INTO usuario (id, nome_de_usuario, nome_de_exibicao, email, hash_da_senha,
	//			timestamp_da_criacao_em_ms, data_de_criacao)
	//		VALUES (?,?,?,?,?,?,FROM_UNIXTIME(?));`,
	//		[
	//			usuarios[i].uuid, usuarios[i].nome, usuarios[i].nome, usuarios[i].email, usuarios[i].senhaHash,
	//	 		usuarios[i].dataDeCriacao, usuarios[i].dataDeCriacaoEmSeg
	//		]
	//	);
	//	i++;
	//}
	//const [usuarioMysql] = await pool.query(`SELECT * FROM usuario;`);
	//console.log('importou usuarios');
	//console.log(usuarioMysql);

	//i = 0;
	//while (i < anuncios.length) {
	//	await pool.query(
	//		`INSERT INTO anuncio (id, id_do_jogo, id_do_usuario, nome_no_jogo, tempo_de_jogo_em_meses,
	//		discord, usa_chat_de_voz, timestamp_da_criacao_em_ms, data_de_criacao)
	//		VALUES (?,?,?,?,?,?,?,?,FROM_UNIXTIME(?));`,
	//		[
	//			anuncios[i].uuid, anuncios[i].uuidDoJogo, anuncios[i].uuidDoUsuario, anuncios[i].nomeNoJogo,
	//			anuncios[i].tempoDeJogoEmMeses, anuncios[i].discord, anuncios[i].usaChatDeVoz,
	//	 		anuncios[i].dataDeCriacao, anuncios[i].dataDeCriacaoEmSeg
	//		]
	//	);
	//	i++;
	//}
	//const [anuncioMysql] = await pool.query(`SELECT * FROM anuncio;`);
	//console.log('importou anuncios');
	//console.log(anuncioMysql.filter((a,i)=>i<5));

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


	//const [a] = await pool.query('SELECT UNIX_TIMESTAMP();');
	//const [a] = await pool.query('SELECT FROM_UNIXTIME(UNIX_TIMESTAMP());');
	//const [a] = await pool.query('SELECT NOW();');
	//const [a] = await pool.query('SELECT CURRENT_DATE();');
	//const [a] = await poolp.query('SELECT UNIX_TIMESTAMP();');
	//const conn = await pool.getConnection();
	//const [a] = await conn.query('SELECT UNIX_TIMESTAMP();');
	//const [a] = await conn.query('SELECT UNIX_TIMESTAMP();');
	//console.log(a);

	//await pool.query('ALTER TABLE usuario ALTER COLUMN data_de_criacao SET DEFAULT CURRENT_TIMESTAMP;');
	//await pool.query('ALTER TABLE sessao ALTER COLUMN data_de_criacao SET DEFAULT CURRENT_TIMESTAMP;');
	//await pool.query('ALTER TABLE recuperacao_de_conta ALTER COLUMN data_de_criacao SET DEFAULT CURRENT_TIMESTAMP;');
	//await pool.query('ALTER TABLE anuncio ALTER COLUMN data_de_criacao SET DEFAULT CURRENT_TIMESTAMP;');
	//await pool.query('ALTER TABLE sessao ADD data_de_expiracao DATETIME NOT NULL;');

	//await pool.query('ALTER TABLE usuario DROP COLUMN timestamp_da_criacao_em_ms;');
	//await pool.query('ALTER TABLE anuncio DROP COLUMN timestamp_da_criacao_em_ms;');

	//const db = await abrirBanco;
	//await db.run(`DELETE FROM Sessoes WHERE dataDeExpiracao < ${Date.now()};`);
	//await db.run(`DELETE FROM RecuperacoesDeConta WHERE dataDeExpiracao < ${Date.now()};`);

	//await db.run(`CREATE TABLE IF NOT EXISTS usuario (
	//	id TEXT PRIMARY KEY,
	//	nome_de_usuario TEXT NOT NULL UNIQUE,
	//	nome_de_exibicao TEXT NOT NULL,
	//	email TEXT NOT NULL UNIQUE,
	//	hash_da_senha TEXT NOT NULL,
	//	data_de_criacao DATETIME NOT NULL
	//);`
	//);
	//await db.run(
	//	`INSERT INTO usuario(id,nome_de_usuario,nome_de_exibicao,email,hash_da_senha,data_de_criacao)
	//	SELECT id,nome,nome,email,senhaHash,dataDeCriacao
	//	FROM Usuarios;`
	//);

	//await db.run(`CREATE TABLE IF NOT EXISTS sessao (
	//	id INTEGER PRIMARY KEY,
	//	id_do_usuario TEXT NOT NULL,
	//	seletor TEXT NOT NULL,
	//	hash_do_token TEXT NOT NULL,
	//	data_de_criacao DATETIME NOT NULL
	//	manter_sessao BOOLEAN NOT NULL
	//);`
	//);

	//await db.run(`CREATE TABLE IF NOT EXISTS recuperacao_de_conta (
	//	id INTEGER PRIMARY KEY,
	//	id_do_usuario TEXT NOT NULL,
	//	hash_do_token TEXT NOT NULL,
	//	data_de_criacao DATETIME NOT NULL);`
	//);

	//db.run(`CREATE TABLE IF NOT EXISTS jogo (
	//	id TEXT PRIMARY KEY,
	//	nome TEXT NOT NULL,
	//	nome_url TEXT NOT NULL,
	//	url_da_imagem TEXT NOT NULL);`
	//);
	//await db.run(
	//	`INSERT INTO jogo(id,nome,nome_url,url_da_imagem)
	//	SELECT uuid,nome,nomeUrl,urlImagem
	//	FROM Jogos;`
	//);

	//db.run(`CREATE TABLE IF NOT EXISTS anuncio (
	//	id TEXT PRIMARY KEY,
	//	id_do_jogo INTEGER NOT NULL,
	//	nome_do_jogo TEXT NOT NULL,  ?
	//	id_do_usuario INTEGER NOT NULL,
	//	nome_do_usuario TEXT NOT NULL,  ?
	//	nome_no_jogo TEXT NOT NULL,
	//	tempo_de_jogo_em_meses INTEGER NOT NULL,
	//	discord TEXT NOT NULL,
	//	usa_chat_de_voz BOOLEAN NOT NULL,
	//	data_de_criacao INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP);`
	//);
	//await db.run(
	//	`INSERT INTO anuncio(id,id_do_jogo,nome_do_jogo ?,
	//	id_do_usuario,nome_do_usuario ?,
	//  tempo_de_jogo_em_meses,discord,usa_chat_de_voz,data_de_criacao)
	//	SELECT (uuid,idDoJogo,nomeDoJogo ? ,idDoUsuario,nomeDoUsuario ? ,tempoDeJogoEmMeses,
	//	discord,usaChatDeVoz,dataDeCriacao)
	//	FROM Anuncios;`
	//);

	//await db.run(
	//	`CREATE TABLE IF NOT EXISTS disponibilidade (
	//		id INTEGER PRIMARY KEY,
	//		id_do_anuncio INTEGER NOT NULL,
	//		hora_de_inicio INTEGER NOT NULL,
	//		hora_de_termino INTEGER NOT NULL,
	//		FOREIGN KEY (id_do_anuncio) REFERENCES anuncio (id)
	//		ON DELETE CASCADE
	//	);`
	//);
	//await db.run(
	//	`INSERT INTO disponibilidade
	//	SELECT id,id_do_anuncio,hora_de_inicio,hora_de_termino
	//	FROM Disponibilidades;`
	//);

	//await db.run(`CREATE TABLE IF NOT EXISTS dias_das_disponibilidades (
	//	id INTEGER PRIMARY KEY,
	//	id_da_disponibilidade INTEGER NOT NULL,
	//	dia INTEGER NOT NULL,
	//	FOREIGN KEY (id_da_disponibilidade) REFERENCES disponibilidade (id)
	//	ON DELETE CASCADE);`
	//);
	//await db.run(
	//	`INSERT INTO dias_das_disponibilidades
	//	SELECT *
	//	FROM DiasDasDisponibilidades;`
	//);


	//await db.run('PRAGMA foreign_keys=off;');
	//await db.run('ALTER TABLE Disponibilidades RENAME TO Disponibilidades_old;');
	//await db.run('ALTER TABLE Disponibilidades2 RENAME TO Disponibilidades;');
	//await db.run('PRAGMA foreign_keys=on;');

	//await db.run(
	//	`CREATE TABLE Disponibilidades2 (
	//		id INTEGER PRIMARY KEY,
	//		idDoAnuncio INTEGER NOT NULL,
	//		horaDeInicio INTEGER NOT NULL,
	//		horaDeTermino INTEGER NOT NULL,
	//		FOREIGN KEY (idDoAnuncio) REFERENCES Anuncios (idDoAnuncio)
	//		ON DELETE CASCADE
	//	);`
	//);
	//await db.run(
	//	`INSERT INTO Disponibilidades2
	//	SELECT id,idDoAnuncio,horaDeInicio,horaDeTermino
	//	FROM Disponibilidades;`
	//);

	//const disps = await db.all(`SELECT id, dias FROM Disponibilidades;`);
	//disps.map(disp=>{
	//	disp.diasArray = disp.dias.split(',').map(d=>Number(d));
	//});
	//let i = 0;
	//while (i < disps.length) {
	//	let placeholders = disps[i].diasArray.map(d => `(${disps[i].id},?)`).join(',');
	//	//let sql = 'INSERT INTO DiasDasDisponibilidades(idDaDisponibilidade, dia) VALUES ' + placeholders;
	//	//console.log(sql);
	//	await db.run(
	//		`INSERT INTO DiasDasDisponibilidades (idDaDisponibilidade, dia) VALUES ${placeholders};`,
	//		disps[i].diasArray
	//	);
	//	i++;
	//}
	//await db.run(`CREATE TABLE IF NOT EXISTS DiasDasDisponibilidades (
	//	id INTEGER PRIMARY KEY,
	//	idDaDisponibilidade INTEGER NOT NULL,
	//	dia INTEGER NOT NULL,
	//	FOREIGN KEY (idDaDisponibilidade) REFERENCES Disponibilidades (id)
	//	ON DELETE CASCADE);`
	//);
	//await db.run(`UPDATE Disponibilidades SET id = rowid WHERE id = 'rowid';`); //rowid foi considerado string kk
	//await db.run(`ALTER TABLE Disponibilidades ADD COLUMN id INTEGER NOT NULL DEFAULT rowid;`);
	//await db.run(`ALTER TABLE RecuperacoesDeConta ADD COLUMN idDoUsuario INTEGER NOT NULL;`);
	//await db.run(`CREATE TABLE IF NOT EXISTS RecuperacoesDeConta (
	//	id INTEGER PRIMARY KEY,
	//	token TEXT NOT NULL,
	//	dataDeExpiracao DATETIME NOT NULL);`
	//);
	//await db.run(`ALTER TABLE Usuarios ADD COLUMN email TEXT;`);
	/*/gera um anúncio aleatório sempre q inicio o server, só pra ir aumentando o tamanho msm
	const {qtdeAnuncios} = await db.get(`SELECT COUNT(1) AS qtdeAnuncios FROM Anuncios;`);
	//const jogo = await db.get(`SELECT id FROM Jogos WHERE nome = 'Sword of Mana';`);
	//const usuario = await db.get(`SELECT id FROM Usuarios WHERE nome = 'teste';`);
	const timeStampDaPublicacao = Date.now();
	const anuncio = {
		idDoJogo: 1,
		idDoUsuario: 1,
		nomeNoJogo: 'Teste de anúncio gerado automaticamente',
		tempoDeJogoEmMeses: qtdeAnuncios % 1200,
		discord: 'Testando, 123, testando, 123, e1e2e3 e1e2e3 e1e2',
		usaChatDeVoz: Boolean(qtdeAnuncios % 2),
		disponibilidades: []
	};
	//gera entre 1 e 5 disponibilidades
	for (let i = 0; i < (qtdeAnuncios % 5 + 1); i++) {
		const dias = [];
		dias.push(qtdeAnuncios % 7);
		for (let i = dias[0]+1; i < 7; i++)
			if ((timeStampDaPublicacao / Math.pow(10,i)) % 2)
				dias.push(i);
		anuncio.disponibilidades.push({
			//idDoAnuncio: anuncioAleatorio.idDoAnuncio,
			dias: dias.join(),
			horaDeInicio: (timeStampDaPublicacao / (i+10)) % 1440,
			horaDeTermino: (timeStampDaPublicacao / (i+1)) % 1440
		})
	}
	await db.run(
		`INSERT INTO Anuncios (idDoJogo, idDoUsuario, nomeNoJogo, tempoDeJogoEmMeses, discord, usaChatDeVoz,
			dataDeCriacao)
		VALUES (?,?,?,?,?,?,?);`,
		[anuncio.idDoJogo, anuncio.idDoUsuario, anuncio.nomeNoJogo, anuncio.tempoDeJogoEmMeses,
			anuncio.discord, anuncio.usaChatDeVoz, timeStampDaPublicacao
		]
	);
	const anuncioAleatorio = await db.get(
		`SELECT idDoAnuncio FROM Anuncios WHERE dataDeCriacao = ${timeStampDaPublicacao};`
	);
	let i = 0;
	while (i < anuncio.disponibilidades.length) {
		await db.run(
			`INSERT INTO Disponibilidades (idDoAnuncio, dias, horaDeInicio, horaDeTermino)
			VALUES (?,?,?,?);`
		);
		i++;
	}*/

	//await db.run(`PRAGMA foreign_keys = ON;`);
	//const A = await db.get(`PRAGMA foreign_keys;`);
	//console.log(A);
	
	//await db.run(`ALTER TABLE Sessoes RENAME COLUMN tokenDaSessaoHash TO uuidDoTokenHash;`);
	//await db.run(`UPDATE Anuncios SET usaChatDeVoz = 1 WHERE usaChatDeVoz = 'on';`);
	//await db.run(`DROP TABLE Jogos;`);
	//await db.run(`DROP TABLE Anuncios;`);
	//await db.run(`ALTER TABLE Jogos2 RENAME TO Jogos;`);
	//await db.run(`ALTER TABLE Anuncios2 RENAME TO Anuncios;`);
	//await db.run(`DELETE FROM Disponibilidades WHERE idDoAnuncio = 35;`);
	//await db.run(`INSERT INTO Disponibilidades(idDoAnuncio,dias,horaDeInicio,horaDeTermino)
		//VALUES (34,2,3,4);`);
	//await db.run(`DELETE FROM Sessoes WHERE id IN (1,2);`);
	//await db.run(`ALTER TABLE Sessoes ADD COLUMN manterSessao BOOLEAN NOT NULL;`);
	//await db.run(`ALTER TABLE SessoesAtivas RENAME TO Sessoes;`);
	//await db.run(`DELETE FROM Sessoes WHERE id IN (1,2);`);
	//await db.run(`ALTER TABLE Sessoes ADD COLUMN seletor TEXT NOT NULL;`);
	//await db.run(`ALTER TABLE Sessoes RENAME COLUMN tokenDaSessao TO tokenDaSessaoHash;`);
	//await db.run(`ALTER TABLE teste RENAME TO Sessoes;`);
	//await db.run(`ALTER TABLE Sessoes ADD COLUMN idDoUsuario INTEGER NOT NULL;`);
	//await db.run(`ALTER TABLE Sessoes ADD COLUMN tokenDaSessao TEXT NOT NULL;`);
	//await db.run(`ALTER TABLE Sessoes ADD COLUMN dataDeExpiracao DATETIME NOT NULL;`);

	//await db.run(`UPDATE Anuncios2 SET idDoUsuario = 12 WHERE idDoUsuario = -1 AND idDoAnuncio = 20;`);
	//await db.run(`DELETE FROM Anuncios2 WHERE idDoAnuncio > 37;`);
	//await db.run(`DELETE FROM Disponibilidades WHERE idDoAnuncio > 37;`);
	//await db.run(`UPDATE Anuncios2 SET idDoUsuario = 1
		//WHERE idDoUsuario = -1 AND idDoAnuncio IN (2,5,8,9,37);`);
	//await db.run(`UPDATE Anuncios2 SET idDoUsuario = 10
		//WHERE idDoUsuario = -1 AND idDoAnuncio IN (15,19,36);`);
	//await db.run(`UPDATE Anuncios2 SET idDoUsuario = 3
		//WHERE idDoUsuario = -1 AND idDoAnuncio IN (22,23,24,32);`);
	//await db.run(`UPDATE Anuncios2 SET idDoUsuario = 2 WHERE idDoUsuario = -1 AND idDoAnuncio IN (6);`);

	//await db.run(`CREATE TABLE IF NOT EXISTS Disponibilidades (
	//	idDoAnuncio INTEGER NOT NULL,
	//	dias TEXT NOT NULL,
	//	horaDeInicio INTEGER NOT NULL,
	//	horaDeTermino INTEGER NOT NULL,
	//	FOREIGN KEY (idDoAnuncio) REFERENCES Anuncios2 (idDoAnuncio)
	//	ON DELETE CASCADE);`
	//);

	//await db.run(`ALTER TABLE Anuncios2 RENAME COLUMN id TO idDoAnuncio;`);
	//await db.run(`ALTER TABLE Anuncios2 DROP COLUMN nomeDoJogo;`);
	//await db.run(`ALTER TABLE Anuncios2 RENAME COLUMN nomeDoUsuario TO nomeNoJogo;`);
	//await db.run(`ALTER TABLE Anuncios2 DROP COLUMN tempoDeJogoEmAnos;`);

	//await db.run(`INSERT INTO Disponibilidades
	//	SELECT idDoAnuncio,diasQueJoga,horaDeInicio,horaDeTermino FROM Anuncios2;`
	//);
	//await db.run(`ALTER TABLE Anuncios2 DROP COLUMN diasQueJoga;`);
	//await db.run(`ALTER TABLE Anuncios2 DROP COLUMN horaDeInicio;`);
	//await db.run(`ALTER TABLE Anuncios2 DROP COLUMN horaDeTermino;`);

	//sqlite n dxa mudar tipo, então n adianta fazer isso... o jeito é recriar
	//await db.run(`ALTER TABLE Jogos ADD COLUMN uuid TEXT DEFAULT 0;`);
	//await db.run(`UPDATE Jogos SET uuid = id WHERE uuid = 0;`);
	//await db.run(`UPDATE Jogos SET id = rowid WHERE uuid = 'id';`);
	//await db.run(`ALTER TABLE Jogos RENAME COLUMN id TO uuid;`);
	//await db.run(`ALTER TABLE Anuncios RENAME COLUMN id TO uuid;`);
	//await db.run(`ALTER TABLE Anuncios ADD COLUMN uuid ;`);
	//await db.run(`CREATE TABLE IF NOT EXISTS teste (id INTEGER PRIMARY KEY);`);
	//await db.run(`ALTER TABLE Jogo RENAME TO Jogos;`);
	//await db.run(`ALTER TABLE Anuncio RENAME TO Anuncios;`);
	//await db.run(`ALTER TABLE Jogos RENAME COLUMN url TO nomeUrl;`);
	//await db.run(`CREATE TABLE IF NOT EXISTS Usuarios (
	//	id INTEGER PRIMARY KEY,
	//	nome TEXT NOT NULL UNIQUE,
	//	senhaHash TEXT NOT NULL,
	//	dataDeCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);`
	//);
	
	//const ultimoAnuncio = await db.get('SELECT * FROM Anuncios
		//WHERE dataDeCriacao = (SELECT MAX(dataDeCriacao) FROM Anuncios);');
	//const anuncioEspecifico = await db.get('SELECT * FROM Anuncios
		//WHERE id = "a4a5b098-7cde-4a45-842f-57ad0706ab12";');
	//console.log(ultimoAnuncio.dataDeCriacao);
	//const d = new Date(ultimoAnuncio.dataDeCriacao);
	//console.log(d.getTime());
	//const anunciosErrados = await db.all('SELECT * FROM Anuncios WHERE dataDeCriacao > 1690864594730;');
	//console.log(anunciosErrados.length);
	
	//db.run(`CREATE TABLE IF NOT EXISTS Jogos2 (
	//	id INTEGER PRIMARY KEY,
	//	nome TEXT NOT NULL,
	//	nomeUrl TEXT NOT NULL,
	//	urlImagem TEXT NOT NULL,
	//	uuid TEXT);`
	//);
	//db.run(`CREATE TABLE IF NOT EXISTS Anuncios2 (
	//	id INTEGER PRIMARY KEY,
	//	idDoJogo INTEGER NOT NULL,
	//	nomeDoJogo TEXT NOT NULL,
	//	idDoUsuario INTEGER NOT NULL,
	//	nomeDoUsuario TEXT NOT NULL,
	//	tempoDeJogoEmAnos INTEGER NOT NULL,
	//	tempoDeJogoEmMeses INTEGER NOT NULL,
	//	discord TEXT NOT NULL,
	//	diasQueJoga TEXT NOT NULL,
	//	deHora INTEGER NOT NULL,
	//	ateHora INTEGER NOT NULL,
	//	usaChatDeVoz BOOLEAN NOT NULL,
	//	dataDeCriacao INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	//	uuid TEXT);`
	//);

	//const a = await db.all(`SELECT rowid,nome,nomeUrl,urlImagem,id FROM Jogos;`);
	//const a = await db.all(`SELECT rowid,nomeDoUsuario,tempoDeJogoEmAnos,discord,diasQueJoga,
		//deHora,ateHora,usaChatDeVoz,dataDeCriacao,id,jogoId FROM Anuncios;`);
	//const j = await db.all(`SELECT rowid,id,nome FROM Jogos;`);
	//const u = await db.all(`SELECT * FROM Usuarios;`);
	//a.map(anuncio=>{
	//	anuncio.idDoJogo = j.find(jo=>jo.id == anuncio.jogoId).rowid;
	//	anuncio.nomeDoJogo = j.find(jo=>jo.id == anuncio.jogoId).nome;
	//	let uid = u.find(us=>us.nome == anuncio.nomeDoUsuario);
	//	if (uid) anuncio.idDoUsuario = uid.id;
	//	else anuncio.idDoUsuario = -1;
	//	anuncio.tempoDeJogoEmMeses = anuncio.tempoDeJogoEmAnos * 12;
	//	anuncio.horaDeInicio = anuncio.deHora;
	//	anuncio.horaDeTermino = anuncio.ateHora;
	//	anuncio.uuid = anuncio.id;
	//});
	//console.log(a);

	//await db.run(`DELETE FROM Anuncios2;`);

	//let i=0;
	//while (i < a.length) {
	//	await db.run(`INSERT INTO Anuncios2
	//		(idDoJogo, nomeDoJogo, idDoUsuario, nomeDoUsuario, tempoDeJogoEmAnos, tempoDeJogoEmMeses, discord,
	//			diasQueJoga, horaDeInicio, horaDeTermino, usaChatDeVoz, dataDeCriacao, uuid)
	//		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);`,
	//		[a[i].idDoJogo, a[i].nomeDoJogo, a[i].idDoUsuario, a[i].nomeDoUsuario, a[i].tempoDeJogoEmAnos,
	//		a[i].tempoDeJogoEmMeses, a[i].discord, a[i].diasQueJoga, a[i].horaDeInicio, a[i].horaDeTermino,
	//		a[i].usaChatDeVoz, a[i].dataDeCriacao, a[i].uuid]
	//	);
	//	console.log('inseriu registro '+(i+1)+' (nome='+a[i].nomeDoUsuario+', discord='+a[i].discord+',
	//		jogo='+a[i].nomeDoJogo+')');
	//	i++;
	//}
	//a.map(async (an,i)=>{
		//console.log([i, an.idDoJogo, an.nomeDoJogo, an.idDoUsuario, an.nomeDoUsuario, an.tempoDeJogoEmAnos,
		//	an.tempoDeJogoEmMeses, an.discord, an.diasQueJoga, an.horaDeInicio, an.horaDeTermino,
		//	an.usaChatDeVoz, an.dataDeCriacao].join(', '));
		//await db.run(`INSERT INTO Anuncios2
		//	(idDoJogo, nomeDoJogo, idDoUsuario, nomeDoUsuario, tempoDeJogoEmAnos, tempoDeJogoEmMeses, discord,
		//		diasQueJoga, horaDeInicio, horaDeTermino, usaChatDeVoz, dataDeCriacao, uuid)
		//	VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);`,
		//	[an.idDoJogo, an.nomeDoJogo, an.idDoUsuario, an.nomeDoUsuario, an.tempoDeJogoEmAnos,
		//	an.tempoDeJogoEmMeses, an.discord, an.diasQueJoga, an.horaDeInicio, an.horaDeTermino,
		//	an.usaChatDeVoz, an.dataDeCriacao, an.uuid]
		//);
		//console.log('inseriu registro '+(i+1)+' (nome='+an.nomeDoUsuario+', discord='+an.discord+')');
	//});


	//const anunciosCertos = await db.all('SELECT * FROM Anuncios WHERE dataDeCriacao > 1690864594730;');
	//await db.run(`INSERT INTO Anuncios2 SELECT * FROM Anuncios WHERE dataDeCriacao > 1690864594730;`);
	//anunciosCertos.map(anu=>db.run(`UPDATE Anuncios2 SET dataDeCriacao = (?)
	//	WHERE dataDeCriacao > 1690864594730;`,
	//	[new Date(anu.dataDeCriacao).getTime()]
	//));
	//anunciosCertos.map(anu=>db.run(`UPDATE Anuncios2 SET dataDeCriacao = (?)
	//	WHERE dataDeCriacao > 1690864594730;`,
	//	[new Date(anu.dataDeCriacao).getTime()])
	//);

	//anunciosCertos.map(an=>{an.dataDeCriacao = new Date(an.dataDeCriacao).getTime()});
	//console.log(anunciosCertos);
	//let anunciosStringInterrogacoes = anunciosCertos.map(()=>'(?)').join();
	//anunciosCertos.map(async(an)=>{await db.run(`INSERT INTO Anuncios2 VALUES (?);`, an);});
	//await db.run(`INSERT INTO Anuncios2
	//	(id, jogoId, nomeDoUsuario, tempoDeJogoEmAnos, discord, diasQueJoga, deHora, ateHora, usaChatDeVoz,
	//		dataDeCriacao)
	//	VALUES `+anunciosStringInterrogacoes+';',
	//	anunciosCertos,
	//	function(err) {
	//		if (err) {
	//			return console.error(err.message);
	//		}
	//		console.log(`Rows inserted ${this.changes}`);
	//	}
	//);
	//const teste = await db.get('SELECT * FROM Anuncios2;');
	//console.log(teste);
	//await db.run(`DROP TABLE Anuncio;`);
	//await db.run(`ALTER TABLE Anuncios2 RENAME TO Anuncios;`);

	//await db.migrate();
	//servidor.listen(
	//	process.env.PORTA_DO_SERVIDOR,
	//	()=>console.log('iniciou server, ouvindo porta '+process.env.PORTA_DO_SERVIDOR)
	//);
}
iniciar();

servidor.get('/', async (req, resp)=>{
	try {
    console.log("Servidor acessado com sucesso.");
		return resp.status(200).json({status: "Servidor acessado com sucesso."});
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
		//console.log('ordenarPor='+ordenarPor+', qtde='+qtde);
		//const db = await abrirBanco;
		//const jogos = await db.all(
		//	`SELECT Jogos.id,nome,nomeUrl,urlImagem,COUNT(Anuncios.idDoJogo) AS qtdeAnuncios
		//	FROM Jogos LEFT JOIN Anuncios
		//	ON Jogos.id = Anuncios.idDoJogo
		//	GROUP BY Jogos.id
		//	ORDER BY ${ordenarPor == 'anuncio' ? 'MAX(Anuncios.dataDeCriacao) DESC' : 'nomeUrl ASC'}
		//	${qtde > 0 ? 'LIMIT '+qtde : ''};`
		//);
		const [jogos] = await pool.query(
			`SELECT jogo.id, nome, nome_url AS nomeUrl, url_da_imagem AS urlImagem, COUNT(anuncio.id) AS qtdeAnuncios
			FROM jogo LEFT JOIN anuncio
			ON jogo.id = anuncio.id_do_jogo
			GROUP BY jogo.id
			ORDER BY ${ordenarPor == 'anuncio' ? 'MAX(anuncio.data_de_criacao) DESC' : 'nomeUrl ASC'}
			${qtde > 0 ? 'LIMIT '+qtde : ''};`
		);
		console.log('GET jogos, qtde='+jogos.length+', ip='+req.ip);
		//const jogosQtde = await db.all(
		//	`SELECT Jogos.id, COUNT(Anuncios.jogoId) AS qtdeAnuncios
		//	FROM Jogos JOIN Anuncios
		//	ON Jogos.id=Anuncios.jogoId
		//	GROUP BY Jogos.id;`
		//);
		//jogos.map(jogo=>jogo._count = {anuncios: jogosQtde.find(j=>j.id==jogo.id).qtdeAnuncios});
		//jogos.map(jogo=>jogo._count = {anuncios: jogo.qtdeAnuncios});
		return resp.status(200).json(jogos);
	}
	catch (erro) {
		//console.log('entrou no catch');
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
		//const tokenDaSessao = req.body.tokenDaSessao;
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		console.log('POST anuncios, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		const anuncio = req.body.anuncio;
		if (anuncio.idDoUsuario != sessaoExiste.idDoUsuario) {
			console.log('problema no id do usuário; id recebido e id do token:');
			console.log(anuncio.idDoUsuario);
			console.log(sessaoExiste.idDoUsuario);
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
			//formato da hora deve ser 2 números, ":", 2 números, sem caracteres antes nem depois
			if (!horaDe.match(/^\d{2}:\d{2}$/))
				return resp.status(400).json({erro: 'Horário em formato inválido.'});
			if (!horaAte.match(/^\d{2}:\d{2}$/))
				return resp.status(400).json({erro: 'Horário em formato inválido.'});
		}

    if (anuncio.usaChatDeVoz === true)
      anuncio.usaChatDeVoz = true;
    else
      anuncio.usaChatDeVoz = false;

		//console.log('PUT anuncios, usuário='+body.idDoUsuario+', ip='+req.ip);

		//console.log(anuncio);
		//console.log(body.disponibilidades);
		//return resp.status(200).json({ok: 'Anúncio recebido, mas não registrado.'});
		//const disponibilidade = [];
		//disponibilidade.push({
		//	diasQueJoga: body.diasQueJoga,
		//	horarioDeInicio: converterHoraStringParaMinutos(body.deHora),
		//	horarioDeTermino: converterHoraStringParaMinutos(body.ateHora)
		//});
	//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT tokenDaSessaoHash, dataDeExpiracao, idDoUsuario FROM Sessoes WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}*/

		//const timeStampDaPublicacao = Date.now();
		//await db.run(
		//	`INSERT INTO Anuncios (idDoJogo, idDoUsuario, nomeNoJogo, tempoDeJogoEmMeses, discord, usaChatDeVoz,
		//		dataDeCriacao)
		//	VALUES (?,?,?,?,?,?,?);`,
		//	[
		//		anuncio.idDoJogo, sessaoExiste.idDoUsuario, anuncio.nomeNoJogo, anuncio.tempoDeJogoEmMeses,
		//		anuncio.discord, anuncio.usaChatDeVoz, timeStampDaPublicacao
		//	]
		//);
		//const anuncioPublicado = await db.get(
		//	`SELECT idDoAnuncio FROM Anuncios WHERE dataDeCriacao = ${timeStampDaPublicacao};`
		//);

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
		//const [anuncioPublicado] = await pool.query(
		//	`SELECT id FROM anuncio WHERE id = ${uuidDoAnuncio};`
		//);

		//let i = 0;
		//while (i < anuncio.disponibilidades.length) {
		//	//await db.run(
		//	//	`INSERT INTO Disponibilidades (idDoAnuncio, dias, horaDeInicio, horaDeTermino)
		//	//	VALUES (?,?,?,?);`,
		//	//	[
		//	//		anuncioPublicado.idDoAnuncio, anuncio.disponibilidades[i].dias,
		//	//		converterHoraStringParaMinutos(anuncio.disponibilidades[i].horaDeInicio),
		//	//		converterHoraStringParaMinutos(anuncio.disponibilidades[i].horaDeTermino)
		//	//	]
		//	//);
		//	await db.run(
		//		`INSERT INTO Disponibilidades (idDoAnuncio, horaDeInicio, horaDeTermino) VALUES (?,?,?);`,
		//		[
		//			anuncioPublicado.idDoAnuncio,
		//			converterHoraStringParaMinutos(anuncio.disponibilidades[i].horaDeInicio),
		//			converterHoraStringParaMinutos(anuncio.disponibilidades[i].horaDeTermino)
		//		]
		//	);
		//	const disp = await db.get(
		//		`SELECT MAX(id) AS id FROM Disponibilidades WHERE idDoAnuncio = ${anuncioPublicado.idDoAnuncio};`
		//	);
		//	//console.log(disp);
		//	let j = 0;
		//	let dias = anuncio.disponibilidades[i].dias.split(',').map(d=>parseInt(d));
		//	while (j < dias.length) {
		//		await db.run(
		//			`INSERT INTO DiasDasDisponibilidades (idDaDisponibilidade, dia) VALUES (?,?);`,
		//			[disp.id, dias[j]]
		//		);
		//		j++;
		//	}
		//	i++;
		//	//console.log(i+','+body.disponibilidades.length);
		//}


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
			//console.log(disp);
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
			//console.log(i+','+body.disponibilidades.length);
		}


		//console.log(anuncioPublicado);
		console.log('Anúncio publicado, id='+anuncioPublicado.idDoAnuncio+'.');
		return resp.status(201).json({ok: 'Anúncio publicado.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//pesquisa anúncios
async function pesquisar(query, idDoUsuario) {
	try {
		//const tempoInicio = Date.now();
		const camposPesquisados = {};
		for (let c in query)
			if(query[c])
				camposPesquisados[c] = query[c];
		if (camposPesquisados.qtdeFiltrosDisponibilidade)
			delete camposPesquisados.qtdeFiltrosDisponibilidade;
		const qtdeCampos = Object.entries(camposPesquisados).length;
		
		//if (!query.jogo) query.jogo = '%';

		//if (!idDoUsuario) idDoUsuario = '%';
		//console.log('body.idDoUsuario='+body.idDoUsuario);
		
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

		//if (!body.discord) body.discord = '%';
		
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
			//return resp.status(400).json({erro: 'Tempo de jogo em formato inválido.'});
			return {status: 400, erro: 'Tempo de jogo em formato inválido.'};

		let disponivelEmQualquer = false;
		if (query.opcoesDisponibilidade && query.opcoesDisponibilidade == 'emQualquer')
			disponivelEmQualquer = true;

		for (let i = 0; i < query.qtdeFiltrosDisponibilidade; i++) {
			let id = i == 0 ? '' : i+1;
			//formato da hora deve ser 2 números, ":", 2 números, sem caracteres antes nem depois
			if (query['de'+id] && !query['de'+id].match(/^\d{2}:\d{2}$/))
				//return resp.status(400).json({erro: 'Horário em formato inválido.'});
				return {status: 400, erro: 'Horário em formato inválido.'};
			if (query['ate'+id] && !query['ate'+id].match(/^\d{2}:\d{2}$/))
				//return resp.status(400).json({erro: 'Horário em formato inválido.'});
				return {status: 400, erro: 'Horário em formato inválido.'};
			}

		let usaChatDeVoz;
		if (query.usaChatDeVoz) {
			if (query.usaChatDeVoz == 'sim')
				usaChatDeVoz = 1;
			else
				usaChatDeVoz = 0;
		}
		//if (!body.usaChatDeVoz) body.usaChatDeVoz = '%';
		//else if (body.usaChatDeVoz == 'sim') body.usaChatDeVoz = 1;
		//else if (body.usaChatDeVoz == 'não') body.usaChatDeVoz = 0;

		let pagina = 1;
		let resultadosPorPagina = 10;
		if (query.pagina)
			pagina = parseInt(query.pagina);
		if(isNaN(pagina))
			//return resp.status(400).json({erro: 'Página em formato inválido.'});
			return {status: 400, erro: 'Página em formato inválido.'};
		if (pagina < 1)
			pagina = 1;
		if (query.resultadosPorPagina)
			resultadosPorPagina = parseInt(query.resultadosPorPagina);
		if(isNaN(resultadosPorPagina))
			//return resp.status(400).json({erro: 'Resultados por página em formato inválido.'});
			return {status: 400, erro: 'Resultados por página em formato inválido.'};
		else if (resultadosPorPagina < 3)
			resultadosPorPagina = 3;
		else if (resultadosPorPagina > 100)
			resultadosPorPagina = 100;
		//console.log('resultadosPorPagina='+resultadosPorPagina+', pagina='+pagina);

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
				//return resp.status(400).json({erro: 'Critério de organização em formato inválido.'});
				return {status: 400, erro: 'Critério de organização em formato inválido.'};
		}
		let emOrdem = -1;
		if (query.emOrdem) {
			if (query.emOrdem == 'crescente')
				emOrdem = 1;
			else if (query.emOrdem != 'decrescente')
				//return resp.status(400).json({erro: 'Ordem de organização em formato inválido.'});
				return {status: 400, erro: 'Ordem de organização em formato inválido.'};
		}

		//console.log(body);

		//const {id: jogoId} = await db.get(`SELECT id FROM Jogos WHERE nomeUrl = (?);`, [body.jogo]);
		//console.log(jogoId);

		//const b2 = {
		//	//jogoId: jogoId,
		//	jogo: body.jogo,
		//	nomeNoJogo: body.nomeNoJogo,
		//	naoContem: naoContem,
		//	//discord: body.discord,
		//	tempoDeJogoEmAnos: tempoDeJogoEmAnos,
		//	noMaximo: noMaximo,
		//	entre: entre,
		//	tempoDeJogoEmAnos2: tempoDeJogoEmAnos2,
		//	//emTodos: emTodos,
		//	//diasQueJoga: diasQueJoga,
		//	//deHora: deHora,
		//	//ateHora: ateHora,
		//	usaChatDeVoz: body.usaChatDeVoz
		//}
		//console.log('body convertido:');
		//console.log(b2);

		//const db = await abrirBanco;
		/*let anuncios = await db.all(
			`SELECT idDoAnuncio, idDoJogo, idDoUsuario, Jogos.nome AS nomeDoJogo, nomeNoJogo, tempoDeJogoEmMeses,
				usaChatDeVoz, dataDeCriacao
			FROM Anuncios JOIN Jogos
			ON Anuncios.idDoJogo = Jogos.id
			WHERE Jogos.nomeUrl ${body.jogo == '%' ? 'LIKE' : '=' } (?)
				AND idDoUsuario ${body.idDoUsuario == '%' ? 'LIKE' : '=' } (?)
				AND nomeNoJogo ${exatamente ? '=' : (naoContem ? 'NOT ' : '') + 'LIKE'} (?)
				AND tempoDeJogoEmMeses ${noMaximo ? '<=' : '>='} ${tempoDeJogoEmMeses}
				${entre ? 'AND tempoDeJogoEmMeses <='+tempoDeJogoEmMeses2 : ''}
				AND usaChatDeVoz LIKE '${usaChatDeVoz}'
			ORDER BY dataDeCriacao DESC;`,
			[body.jogo, body.idDoUsuario, body.nomeNoJogo]
		);*/

		//let anuncios = await db.all(
		//	`SELECT Anuncios.id, jogoId, Jogos.nome AS nomeDoJogo, nomeDoUsuario, tempoDeJogoEmAnos,
		//		diasQueJoga, deHora, ateHora, usaChatDeVoz, dataDeCriacao
		//	FROM Anuncios JOIN Jogos ON jogoId = Jogos.id
		//	WHERE Jogos.nomeUrl LIKE (?)
		//	  AND nomeDoUsuario ${exatamente ? '=' : (naoContem ? 'NOT ' : '') + 'LIKE'} (?)
		//		AND tempoDeJogoEmAnos ${noMaximo ? '<=' : '>='} (?)
		//		${''/*AND diasQueJoga LIKE (?)
		//		AND deHora <= (?)
		//		AND ateHora >= (?)*/}
		//		AND usaChatDeVoz LIKE (?)
		//	ORDER BY dataDeCriacao DESC;`,
		//	[body.jogo, body.nome, tempoDeJogoEmAnos, body.usaChatDeVoz]
		//);

		//console.log('qtde an='+anuncios.length);
		//console.log(anuncios);
		
		//let idsDosAnuncios = anuncios.map(an=>an.idDoAnuncio).join();
		//console.log(idsDosAnuncios);
		//let disponibilidades = await db.all(
		//	`SELECT idDoAnuncio,dias,horaDeInicio,horaDeTermino
		//	FROM Disponibilidades
		//	WHERE idDoAnuncio IN (${idsDosAnuncios});`
		//);
		//console.log('qtde disp='+disponibilidades.length);
		//anuncios.map(an=>{
		//	an.disponibilidades = disponibilidades.filter(disp=>disp.idDoAnuncio == an.idDoAnuncio);
		//	//console.log(an.disponibilidades);
		//});
		//disponibilidades.map(disp=>{

		//})
		//console.log(disponibilidades);
		//console.log(anuncios);

		//console.log('ants do filtro d tempoDeJogoEntre, qtde= '+anuncios.length);

		//if (entre)
			//anuncios = anuncios.filter(anuncio=>anuncio.tempoDeJogoEmAnos <= tempoDeJogoEmAnos2);
			//anuncios = anuncios.filter(anuncio=>anuncio.tempoDeJogoEmMeses <= tempoDeJogoEmMeses2);
		
		//console.log('dps do filtro d tempoDeJogoEntre e ants do d disponibilidade, qtde= '+anuncios.length);
		
		//const sqlDisp = [];
		let sqlDisp2 = [];

		if (query.qtdeFiltrosDisponibilidade) {
			//const disponibilidades = [];
			let qualquerDia;
			let diasQueJoga = [];
			const dias = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
			let deHora;
			let ateHora;
			//let anunciosOu = [];
			//let diasQueJogaString = '';

			for (let i = 0; i < query.qtdeFiltrosDisponibilidade; i++) {
				//console.log('ants do filtro '+i);
				//console.log(anuncios);
				qualquerDia = false;
				
				let id = i == 0 ? '' : i+1;
				if (query['quando'+id] == 'qualquerDia')
					qualquerDia = true;
				//if (query['quando'+id] == 'qualquerDia' || query['quando'+id] == 'todoDia') {
				if (query['quando'+id] == 'todoDia') {
					//diasQueJoga = '.*';
				//	diasQueJoga = [];
				//else if (body['quando'+id] == 'todoDia')
					//diasQueJoga = '0,1,2,3,4,5,6';
					//diasQueJogaString = '0,1,2,3,4,5,6';
					diasQueJoga = [0,1,2,3,4,5,6];
				} else if (query['quando'+id] == 'semana') {
					//diasQueJoga = '.*1,2,3,4,5.*';
					//diasQueJogaString = '%1,2,3,4,5%';
					diasQueJoga = [1,2,3,4,5];
				} else if (query['quando'+id] == 'finsDeSemana') {
					//diasQueJoga = '0.*6';
					//diasQueJogaString = '0%6';
					diasQueJoga = [0,6];
				} else
					dias.some((dia,i)=>{
						if (dia == query['quando'+id]) {
							//diasQueJoga = '.*'+i+'.*';
							//diasQueJogaString = '%'+i+'%';
							diasQueJoga = [i];
							return true;
						}
					});

				//console.log('diasQueJoga'+id+'= '+diasQueJoga);

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
				//if (pesqHoraDeInicio == undefined && pesqHoraDeTermino != undefined)
				//	pesqHoraDeInicio = pesqHoraDeTermino;
				//if (pesqHoraDeInicio != undefined && pesqHoraDeTermino == undefined)
				//	pesqHoraDeTermino = pesqHoraDeInicio;
				//if (pesqHoraDeInicio == undefined && pesqHoraDeTermino == undefined)
				//	pesqHoraDeInicio = pesqHoraDeTermino = 0;


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

				//sqlDisp.push(`
				//	(
				//		horaDeInicio = horaDeTermino
				//	OR
				//		((horaDeTermino - horaDeInicio + 1440) % 1440)
				//		- ((${pesqHoraDeInicio == undefined ? 'horaDeInicio' : pesqHoraDeInicio} - horaDeInicio + 1440) % 1440)
				//		>= ((${pesqHoraDeTermino == undefined ? 'horaDeTermino' : pesqHoraDeTermino} - ${pesqHoraDeInicio == undefined ? 'horaDeInicio' : pesqHoraDeInicio} + 1440) % 1440)
				//	)
				//	${qualquerDia ? '' : ` AND dias LIKE '${diasQueJogaString}'`}
				//`);

				const consultaHorario = `(
					hora_de_inicio = hora_de_termino
				OR
					((hora_de_termino - hora_de_inicio + 1440) % 1440)
					- ((${pesqHoraDeInicio == undefined ? 'hora_de_inicio' : pesqHoraDeInicio} - hora_de_inicio + 1440) % 1440)
					>= ((${pesqHoraDeTermino == undefined ? 'hora_de_termino' : pesqHoraDeTermino} - ${pesqHoraDeInicio == undefined ? 'hora_de_inicio' : pesqHoraDeInicio} + 1440) % 1440)
				)`;

				//sqlDisp.push(
				//	qualquerDia ?
				//		consultaHorario
				//	:
				//		diasQueJoga.map(d=>
				//			`EXISTS (
				//				SELECT idDoAnuncio FROM Disponibilidades WHERE
				//				${(pesqHoraDeInicio == undefined && pesqHoraDeTermino == undefined) ? '' :
				//					consultaHorario + ' AND '
				//				}
				//				dias LIKE '${d}'
				//			)`
				//		).join(' AND ')
				//);

				//console.log(qualquerDia);
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

				//disponibilidades.push({diasQueJoga, deHora, ateHora});
				//console.log('deHora~ateHora= '+deHora+'~'+ateHora);

				//if(!disponivelEmTodos) {
				//	;
				//} else
				/*anuncios = anuncios.filter(anuncio=>{
					//anuncio.disponibilidades;
					//for (let j = 0; j < anuncio.disponibilidades.length; j++) {
					//	const element = anuncio.disponibilidades[j];
					//}
					let dispEncontradas = [];
					let encontrouTodas = false;
					//console.log('diasQueJoga busca=');
					//console.log(diasQueJoga);
					diasQueJoga.map(dia=>{
						//console.log('dia='+dia);
						//anuncio.disponibilidades.map(disp=>{
						for (let j = 0; j < anuncio.disponibilidades.length && !encontrouTodas; j++) {
							const anDispAtual = anuncio.disponibilidades[j];
							
							let diasAnDispAtual = anDispAtual.dias.split(',');
							//console.log('j='+j+', disp e arrDisp=');
							//console.log(disp);
							//console.log(arrDisp);
						
							//console.log('deHora~ateHora= '+deHora+'~'+ateHora);
							let horaDeInicio = deHora;
							if (horaDeInicio == undefined)
								horaDeInicio = anDispAtual.horaDeInicio;
							let horaDeTermino = ateHora;
							if (horaDeTermino == undefined)
								horaDeTermino = anDispAtual.horaDeTermino;
							//console.log('horaDeInicio~horaDeTermino= '+horaDeInicio+'~'+horaDeTermino);
							let duracaoBusca = (1440 + horaDeTermino - horaDeInicio) % 1440;
							let duracaoAnuncio = (1440 + anDispAtual.horaDeTermino - anDispAtual.horaDeInicio) % 1440;
							let diferencaInicio = (1440 - anDispAtual.horaDeInicio + horaDeInicio) % 1440;
							//console.log('duracaoBusca,duracaoAnuncio,diferencaInicio= '+duracaoBusca+','
							//	+duracaoAnuncio+','+diferencaInicio);
							//if (anuncio.idDoAnuncio == 38)
							//console.log(diasAnDispAtual);
							//if (anuncio.idDoAnuncio == 38)
							//console.log(dia);
							//if (anuncio.idDoAnuncio == 38 && diasAnDispAtual.some(d=>d==dia))
							//console.log(dia);

							if ((duracaoAnuncio - diferencaInicio >= duracaoBusca || duracaoAnuncio == 0)
							&& diasAnDispAtual.some(d=>d==dia) && !dispEncontradas.some(d=>d==dia)) {
								dispEncontradas.push(dia);
								dispEncontradas.sort();
								//if (anuncio.idDoAnuncio == 38){
								//	console.log('dia='+dia+', dispEncontradas=');
								//	console.log(dispEncontradas);}
								if (qualquerDia)
									encontrouTodas = true;
							}
							//console.log('dispEncontradas e diasQueJoga=');
							//console.log(dispEncontradas);
							//console.log(diasQueJoga);
							if (dispEncontradas.join() == diasQueJoga.join())
								encontrouTodas = true;
							//console.log(encontrouTodas);
						}
						//});
					});
					//let passou2 = disp.diasQueJoga.match(diasQueJoga)
					//							&& duracaoAnuncio - diferencaInicio >= duracaoBusca;
					let passou2 = encontrouTodas;
					if (!disponivelEmTodos){
						if (passou2)
							anunciosOu.push(anuncio);
						passou2 = !passou2;
					}
					//console.log('anuncio '+anuncio.idDoAnuncio+'='+passou2);
					return passou2;

					/*let horaDeInicio = deHora || anuncio.disponibilidades[0].horaDeInicio;
					let horaDeTermino = ateHora || anuncio.disponibilidades[0].horaDeTermino;
					console.log('horaDeInicio~horaDeTermino= '+horaDeInicio+'~'+horaDeTermino);
					//if (!body['de'+id])
					//if (deHora == undefined)
					//		horaDeInicio = anuncio.disponibilidades[0].horaDeInicio;
					//if (!body['ate'+id])
					//if (ateHora == undefined)
					//		horaDeTermino = anuncio.disponibilidades[0].horaDeTermino;
					let duracaoBusca = (1440 + horaDeTermino - horaDeInicio) % 1440;
					//if (duracaoBusca < 0) duracaoBusca += 1440;
					let duracaoAnuncio = (1440 + anuncio.disponibilidades[0].horaDeTermino
						- anuncio.disponibilidades[0].horaDeInicio) % 1440;
					//if (duracaoAnuncio < 0) duracaoAnuncio += 1440;
					//console.log('duração busca/anúncio= '+duracaoBusca+'/'+duracaoAnuncio);
					let diferencaInicio = (1440 - anuncio.disponibilidades[0].horaDeInicio + horaDeInicio) % 1440;
					//duracaoAnuncio = anuncio.horaDeInicio > horaDeInicio ?
					//	anuncio.horaDeInicio + duracaoAnuncio - 1440 - horaDeInicio :
					//	duracaoAnuncio;
					//console.log('duração anúncio2= '+duracaoAnuncio+', condições:');

					//console.log('tá nos dias que joga='+anuncio.diasQueJoga.match(diasQueJoga) ? true : false);
					//console.log('tá no período q joga='+duracaoAnuncio - diferençaInicio >= duracaoBusca);

					let passou = anuncio.disponibilidades[0].diasQueJoga.match(diasQueJoga)
											&& duracaoAnuncio - diferencaInicio >= duracaoBusca;
					if (!disponivelEmTodos){
						if (passou)
							anunciosOu.push(anuncio);
						passou = !passou;
					}
					return passou; * /
				});*/
				//console.log('dps do filtro '+i);
				//console.log(anuncios);
			}
			//console.log(anunciosOu.map(a=>a.idDoAnuncio).join());

			//if (!disponivelEmTodos)
			//	anuncios = anunciosOu.sort((a,b)=>b.dataDeCriacao - a.dataDeCriacao);
				
			//console.log(disponibilidades);
		}
		//console.log('dps do filtro d disponibilidade, qtde='+anuncios.length);

		//////////////////////////////

		//console.log('sqlDisp:');
		//console.log(sqlDisp.map(s=>s.replaceAll('\t','').replaceAll('\n',' ')));

		//const jogos = await db.all(`SELECT id, nome, nomeUrl FROM Jogos;`);
		const [jogos] = await pool.query(`SELECT id, nome, nome_url AS nomeUrl FROM jogo;`);

		let jogo;
		if (query.jogo)
			jogo = jogos.find(j=>j.nomeUrl == query.jogo);
		//console.log(jogo);
		//let jogo;
		//if (body.jogo != '%')
		//	jogos.some(j=>{
		//		if(j.nomeUrl == body.jogo) {
		//			jogo = j;
		//			return true;
		//		}
		//	});
			//jogo = jogos.filter(j=>j.nomeUrl==body.jogo);
		//if (body.jogo != '%') {
		//	console.log(jogos.find(j=>j.nomeUrl == body.jogo));
		//}
		//	jogo = await db.get(`SELECT id FROM Jogos WHERE nomeUrl = (?);`, [body.jogo]);
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

				${//sqlDisp.length > 0 ? ' AND ' + sqlDisp.join(disponivelEmQualquer ? ' OR ' : ' AND ') : ''
				''}
				${sqlDisp2.length > 0 ? ' AND ' + sqlDisp2.join(disponivelEmQualquer ? ' OR ' : ' AND ') : ''}
			
				GROUP BY anuncio.id
			ORDER BY data_de_criacao DESC;`;
		
		//console.log('sqlAnuncios:');
		//console.log(sqlAnuncios.replaceAll('\t','').replaceAll('\n',' '));
		//console.log(sqlDisp);
		//console.log(sqlDisp2.join(disponivelEmQualquer ? ' OR ' : ' AND ').replaceAll('\t','').replaceAll('\n',' '));

		//await db.run('EXPLAIN QUERY PLAN '+sqlAnuncios, [idDoUsuario, query.nomeNoJogo], function(err, rows) {
		//	rows.forEach(function (row) {
		//		console.log('a');
		//	})
		//});

		//let anuncios = await db.all(sqlAnuncios, [query.nomeNoJogo]);
		let [anuncios] = await pool.query(sqlAnuncios, [query.nomeNoJogo]);
		//console.log(anuncios2.map(an=>an.idDoAnuncio));
		//console.log(anuncios2.length);

		const idsDosAnuncios = "'" + anuncios.map(an=>an.idDoAnuncio).join("','") + "'";
		//console.log(idsDosAnuncios);
		//let an2 = await db.all(
		//	`SELECT idDoAnuncio, idDoJogo, idDoUsuario, nomeNoJogo, tempoDeJogoEmMeses, usaChatDeVoz, dataDeCriacao
		//	FROM Anuncios
		//	WHERE idDoAnuncio IN (${idsDosAnuncios2});`
		//);
		const [disponibilidades] = await pool.query(
			`SELECT id, id_do_anuncio AS idDoAnuncio, hora_de_inicio AS horaDeInicio, hora_de_termino AS horaDeTermino
			FROM disponibilidade
			WHERE id_do_anuncio IN (${idsDosAnuncios});`
		);
		//console.log('qtde disp='+disponibilidades.length);
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
			//an.nomeDoJogo = jogos.find(j=>{
			//	if(j.id == an.idDoJogo)
			//		return j.nome;
			//})
			//console.log(an.nomeDoJogo);
			an.disponibilidades = disponibilidades.filter(disp=>disp.idDoAnuncio == an.idDoAnuncio);
			//console.log(an.disponibilidades);
		});

		anuncios.map(an=>{
			an.disponibilidades.map(disp=>{
				delete disp.idDoAnuncio;
				//disp.dias = disp.dias.split(',');
				disp.horaDeInicio = converterMinutosParaHoraString(disp.horaDeInicio);
				disp.horaDeTermino = converterMinutosParaHoraString(disp.horaDeTermino);
			});
		});

		//console.log('anúncios ants d ordenar:');
		//console.log(anuncios2);
		//console.log('ordenarPor, emOrdem');
		//console.log(ordenarPor+', '+emOrdem);
		//console.log(anuncios2[0][ordenarPor]);

		if (ordenarPor == 'dias'){
			//console.log(anuncios2[0].disponibilidades[0][ordenarPor]);
			anuncios.sort((a,b)=>
				a.disponibilidades[0][ordenarPor].localeCompare(b.disponibilidades[0][ordenarPor].search())
			);
		}
		else 
		if (ordenarPor == 'horaDeInicio' || ordenarPor == 'horaDeTermino'){
			//console.log(anuncios2[0].disponibilidades[0][ordenarPor]);
			anuncios.sort((a,b)=>a.disponibilidades[0][ordenarPor] - b.disponibilidades[0][ordenarPor]);
		}
		//else if (ordenarPor == 'tempoDeJogoEmMeses')
		//	anuncios2.sort((a,b)=>a[ordenarPor] - b[ordenarPor]);
		//else if (ordenarPor == 'usaChatDeVoz')
		//	anuncios2.sort((a,b)=>a[ordenarPor] - b[ordenarPor]);
		else 
		if (ordenarPor == 'nomeUrlDoJogo' || ordenarPor == 'nomeNoJogo'){
			//console.log(anuncios2[0][ordenarPor]);
			anuncios.sort((a,b)=>a[ordenarPor].toLowerCase().localeCompare(b[ordenarPor].toLowerCase()));
		}
		else{
			//console.log(anuncios2[0][ordenarPor]);
			anuncios.sort((a,b)=>a[ordenarPor] - b[ordenarPor]);
			//anuncios2.sort();
		}

		if(emOrdem < 0)
			anuncios.reverse();

		//if (ordenarPor == 'dias' || ordenarPor == 'horaDeInicio' || ordenarPor == 'horaDeTermino')
		//	console.log(anuncios2.map(a=>a.disponibilidades[0][ordenarPor]));
		//else
		//	console.log(anuncios2.map(a=>a[ordenarPor]));

		//console.log('anúncios dps d ordenar:');
		//console.log(anuncios);
		//console.log(anuncios2.map(a=>a.disponibilidades));

		//////////////////////////////
		
		//console.log({
		//	diasQueJoga: anuncios[0].diasQueJoga.split(','),
		//	horarioDeInicio: converterMinutosParaHoraString(anuncios[0].deHora),
		//	horarioDeTermino: converterMinutosParaHoraString(anuncios[0].ateHora)
		//});
		//anuncios2.map(anuncio=>{
		//	anuncio.disponibilidades.sort((a,b)=>a.dias - b.dias);
		//	anuncio.disponibilidades.map(disp=>{
		//		delete disp.idDoAnuncio;
		//		disp.dias = disp.dias.split(',');
		//		disp.horaDeInicio = converterMinutosParaHoraString(disp.horaDeInicio);
		//		disp.horaDeTermino = converterMinutosParaHoraString(disp.horaDeTermino);
		//	});
		//});
		const totalDeAnuncios = anuncios.length;
		const totalDePaginas = Math.ceil(totalDeAnuncios / resultadosPorPagina);
		
		if (pagina > totalDePaginas)
			pagina = totalDePaginas;
		const anunciosDaPagina = anuncios.filter((a,i)=>
			i >= (pagina-1)*resultadosPorPagina && i < pagina*resultadosPorPagina
		);
		//const tempoPesquisa = Date.now() - tempoInicio;
//		console.log('GET anuncios, qtde campos='+qtdeCampos+', qtde resultados='+anuncios2.length+', ip='+req.ip);
		console.log('qtde campos='+qtdeCampos+', qtde resultados='+anuncios.length);
		//console.log('tempoPesquisa='+tempoPesquisa);
		//console.log(
		//	'POST anuncios, qtde campos='+qtdeCampos+', qtde resultados='+anuncios2.length
		//	+', ip='+req.ip+(qtdeCampos > 0 ? ', campos:' : '')
		//);
		//if (qtdeCampos > 0)
		//	console.log(camposPesquisados);
		return {anuncios: anunciosDaPagina, totalDeAnuncios, pagina, totalDePaginas, resultadosPorPagina};
		//return resp.status(200).json({anuncios: anunciosDaPagina, totalDeAnuncios, pagina, totalDePaginas}
			//.map(anuncio=>{
			//return {...anuncio,
				//nomeDoJogo: jogo.anuncio.nomeDoJogo,
				//nomeDoUsuario: anuncio.nomeNoJogo,
				//tempoDeJogoEmAnos: anuncio.tempoDeJogoEmMeses/12,
				//tempoDeJogoEmMeses: anuncio.tempoDeJogoEmMeses,
				//diasQueJoga: anuncio.diasQueJoga.split(','),
				//diasQueJoga: anuncio.disponibilidades[0].dias,
				//deHora: converterMinutosParaHoraString(anuncio.disponibilidades[0].horaDeInicio),
				//ateHora: converterMinutosParaHoraString(anuncio.disponibilidades[0].horaDeTermino)
				//deHora: anuncio.disponibilidades[0].horaDeInicio,
				//ateHora: anuncio.disponibilidades[0].horaDeTermino
		//	};
		//})
		//);
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		//return resp.status(500).json({erro: 'Erro interno no servidor.'});
		return {status: 500, erro: 'Erro interno no servidor.'};
	}
}

servidor.get('/anuncios', async (req, resp)=>{
	console.log('GET anuncios, ip='+req.ip);
	const anuncios = await pesquisar(req.query);
	if (anuncios.erro)
		return resp.status(anuncios.status).json({erro: anuncios.erro});
	return resp.status(200).json(anuncios);
});

servidor.get('/usuarios/:idDoUsuario/anuncios', async (req, resp)=>{
	console.log('GET usuarios/:idDoUsuario/anuncios, id='+req.params.idDoUsuario+', ip='+req.ip);
	const sessaoExiste = await autenticarSessao(req.get('Authorization'));
	if (sessaoExiste.erro)
		return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
	if (sessaoExiste.idDoUsuario != req.params.idDoUsuario) //lembrete: é possível isso?
		return resp.status(409).json({erro: 'O token não pertence ao usuário informado.'});
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
		//const db = await abrirBanco;
		//const anuncioExiste = await db.get(`SELECT discord FROM Anuncios WHERE idDoAnuncio = ${idDoAnuncio};`);
		const [[anuncioExiste]] = await pool.query(`SELECT discord FROM anuncio WHERE id = '${idDoAnuncio}';`);
		if (!anuncioExiste) {
			console.log('Anúncio não encontrado.');
			return resp.status(404).json({erro: 'Anúncio não encontrado.'});
		}
		console.log('GET anuncios/:idDoAnuncio/discord, discord='+anuncioExiste.discord+', ip='+req.ip);
		return resp.status(200).json({discord: anuncioExiste.discord});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//exclui um anúncio
servidor.delete('/anuncios/:idDoAnuncio', async (req, resp)=>{
	try {
		//const body = req.body;
		const idDoAnuncio = req.params.idDoAnuncio;
		//const idDoAnuncio = body.idDoAnuncio;
		//console.log('DELETE anuncios/:id, id='+id+', ip='+req.ip);
		//const tokenDaSessao = body.tokenDaSessao;
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		console.log('DELETE anuncios/:idDoAnuncio, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT id, tokenDaSessaoHash, dataDeExpiracao, idDoUsuario FROM Sessoes WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}*/

		//const anuncioExiste = await db.get(
		//	`SELECT idDoAnuncio,idDoUsuario FROM Anuncios WHERE idDoAnuncio = ${idDoAnuncio};`
		//);
		//const disponibilidadesExistem = await db.all(
		//	`SELECT id,idDoAnuncio FROM Disponibilidades WHERE idDoAnuncio = ${idDoAnuncio};`
		//);
		//const idsDasDisponibilidades = disponibilidadesExistem.map(d=>d.id).join();
		//const diasExistem = await db.all(
		//	`SELECT id FROM DiasDasDisponibilidades
		//	WHERE idDaDisponibilidade IN (${idsDasDisponibilidades});`
		//);
		
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
			return resp.status(409).json({erro: 'O anúncio não pertence ao usuário informado.'});
		//await db.run(`DELETE FROM Anuncios WHERE idDoAnuncio = ${idDoAnuncio};`);
		//await db.run(`DELETE FROM Disponibilidades WHERE idDoAnuncio = ${idDoAnuncio};`);
		//await db.run(
		//	`DELETE FROM DiasDasDisponibilidades WHERE idDaDisponibilidade IN (${idsDasDisponibilidades});`
		//);
		
		await pool.query(`DELETE FROM anuncio WHERE id = '${idDoAnuncio}';`);
		await pool.query(`DELETE FROM disponibilidade WHERE id_do_anuncio = '${idDoAnuncio}';`);
		await pool.query(
			`DELETE FROM dia_da_disponibilidade WHERE id_da_disponibilidade IN (${idsDasDisponibilidades});`
		);

		//await new Promise(r=>setTimeout(r,1000));
		console.log('Anúncio excluído.');
		return resp.status(200).json({ok: 'Anúncio excluído.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//cadastra usuário
servidor.post('/usuarios', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST usuarios, usuário='+body.nomeDoUsuario+', ip='+req.ip);
		//console.log('sql='+`SELECT * FROM Usuarios WHERE nome = '${body.nomeDoUsuario}';`);
		//const db = await abrirBanco;
		//const usuarioJaExiste = await db.get(
		//	`SELECT nome FROM Usuarios WHERE nome = (?);`,
		//	[body.nomeDoUsuario]
		//);
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
		//console.log('já existe='+usuarioJaExiste);
		if (usuarioJaExiste) {
			console.log('Nome de usuário não disponível.');
			return resp.status(422).json({erro: 'Nome de usuário não disponível.'});
		}
		const senhaHash = await bcrypt.hash(body.senha, BCRYPT_SALT_ROUNDS);
		//console.log('senhaHash='+senhaHash);
		//await db.run(`INSERT INTO Usuarios (id, nome, senhaHash, dataDeCriacao) VALUES (?,?,?,?);`,
			//[uuidv4(), body.nomeDoUsuario, senhaHash, Date.now()],
		
		//const timeStampDoRegistro = Date.now();
		//await db.run(`INSERT INTO Usuarios (nome, senhaHash, email, dataDeCriacao) VALUES (?,?,?,?);`,
		//	[body.nomeDoUsuario, senhaHash, body.email, timeStampDoRegistro],
		//	function(erro) {
		//		console.log('quando isso é executado??');
		//		if (erro) {
		//			console.log('erro:');
		//			console.log(erro);
		//			return console.log(erro);
		//		}
		//		console.log(`A row has been inserted with rowid ${this.lastID}`);
		//		return this.lastID;
		//	}
		//);
		//const usuarioRegistrado = await db.get(
		//	`SELECT id, nome FROM Usuarios WHERE dataDeCriacao = ${timeStampDoRegistro};`
		//);

		const usuarioRegistrado = {};
		usuarioRegistrado.id = uuidv4();
		await pool.query(`INSERT INTO usuario (id, nome_de_usuario, hash_da_senha, email) VALUES (?,?,?,?);`,
			[usuarioRegistrado.id, body.nomeDoUsuario, senhaHash, body.email]
		);
		usuarioRegistrado.nome = body.nomeDoUsuario;

		console.log('Usuário registrado, id='+usuarioRegistrado.id+'.');
		//console.log(usuarioRegistrado);
		//return resp.status(201).json({usuario: usuarioRegistrado});
		return resp.status(201).json(usuarioRegistrado);
		//const token = {id: usuarioRegistrado.id, nome: usuarioRegistrado.nome, tokenDaSessao: uuidv4()};
		//const tokenDaSessaoHash = await bcrypt.hash(token.tokenDaSessao, bcryptSaltRounds);
		//const daquiAUmMes = Date.now()+30*24*60*60*1000;
		//await db.run(`INSERT INTO Sessoes (tokenDaSessaoHash, idDoUsuario, dataDeExpiracao) VALUES (?,?,?);`,
		//	[tokenDaSessaoHash, token.id, daquiAUmMes],
		//	function(erro) {
		//		console.log('quando isso é executado??');
		//		if (erro) {
		//			console.log('erro:');
		//			console.log(erro);
		//			return console.log(erro);
		//		}
		//		console.log(`A row has been inserted with rowid ${this.lastID}`);
		//		return this.lastID;
		//	}
		//);
		//return resp.status(201).json(token);
	}
	catch (erro) {
		//console.log('entrou no catch');
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
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.'});
		//const db = await abrirBanco;
		//const usuario = await db.get(`SELECT nome, email FROM Usuarios WHERE id = ${idDoUsuario};`);
		const [[usuario]] = await pool.query(
			`SELECT nome_de_usuario AS nome, email FROM usuario WHERE id = '${idDoUsuario}';`
		);
		return resp.status(200).json(usuario);
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});
	
//altera dados do usuário
servidor.put('/usuarios/:idDoUsuario', async (req, resp)=>{
//servidor.put('/usuarios/senha', async (req, resp)=>{
	try {
		const body = req.body;
		//console.log('PUT usuarios/senha, id do usuário='+body.id+', ip='+req.ip);
		const idDoUsuario = req.params.idDoUsuario;
		//const tokenDaSessao = body.tokenDaSessao;
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		console.log('PUT usuarios/:idDoUsuario='+idDoUsuario+', ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		if (sessaoExiste.idDoUsuario != idDoUsuario) //lembrete: é possível isso?
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.'});
		const usuarioExiste = await verificarCredenciais('', body.senha, sessaoExiste.idDoUsuario);
		if (usuarioExiste.erro)
			return resp.status(usuarioExiste.status).json({erro: usuarioExiste.erro});
		//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT id, tokenDaSessaoHash, dataDeExpiracao, idDoUsuario FROM Sessoes WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}

		const usuarioExiste = await db.get(
			`SELECT senhaHash FROM Usuarios WHERE id = ${sessaoExiste.idDoUsuario};`,
			function(erro) {
				console.log('quando isso é executado?? - buscando usuário');
				if (erro) {
					console.log('erro:');
					console.log(erro);
					return console.log(erro);
				}
				console.log(`A row has been inserted with rowid ${this.lastID}`);
				return this.lastID;
			}
		);
		if (!usuarioExiste) {
			console.log('Usuário não registrado.');
			return resp.status(404).json({erro: 'Usuário não registrado.'});
		}
		const senhaCorreta = await bcrypt.compare(body.senha, usuarioExiste.senhaHash);
		if (!senhaCorreta) {
			console.log('Senha incorreta.');
			return resp.status(200).json({erro: 'Senha incorreta.'});
		}*/
		if (body.email) {
			if (!body.email.match(
				/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
			)) {
				console.log('E-mail em formato inválido.');
				return resp.status(400).json({erro: 'E-mail em formato inválido.'});
			}
			//await db.run(`UPDATE Usuarios SET email = '${body.email}' WHERE id = ${sessaoExiste.idDoUsuario};`);
			await pool.query(`UPDATE usuario SET email = '${body.email}' WHERE id = '${sessaoExiste.idDoUsuario}';`);
		}
		if (body.novaSenha) {
			const novaSenhaIgual = await bcrypt.compare(body.novaSenha, usuarioExiste.senhaHash);
			if (novaSenhaIgual) {
				console.log('A nova senha não pode ser igual à atual.');
				return resp.status(422).json({erro: 'A nova senha não pode ser igual à atual.'});
			}
			const novaSenhaHash = await bcrypt.hash(body.novaSenha, BCRYPT_SALT_ROUNDS);
			//await db.run(
			//	`UPDATE Usuarios SET senhaHash = '${novaSenhaHash}' WHERE id = ${sessaoExiste.idDoUsuario};`
			//);
			await pool.query(
				`UPDATE usuario SET hash_da_senha = '${novaSenhaHash}' WHERE id = '${sessaoExiste.idDoUsuario}';`
			);
		}
		//await db.run(`INSERT INTO Usuarios (id, nome, senhaHash, dataDeCriacao) VALUES (?,?,?,?);`,
			//[uuidv4(), body.nomeDoUsuario, senhaHash, Date.now()],
		//await db.run(
		//	`UPDATE Usuarios SET senhaHash = '${novaSenhaHash}' WHERE nome = '${body.nomeDoUsuario}';`
		//);
		//exclui sessões de outros dispositivos
		//await db.run(
		//	`DELETE FROM Sessoes
		//	WHERE idDoUsuario = ${sessaoExiste.idDoUsuario} AND seletor != '${sessaoExiste.seletor}';`
		//);
		await pool.query(
			`DELETE FROM sessao
			WHERE id_do_usuario = '${sessaoExiste.idDoUsuario}' AND seletor != '${sessaoExiste.seletor}';`
		);
		console.log('Dados alterados com sucesso.');
		return resp.status(200).json({ok: 'Dados alterados com sucesso.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//inicia processo de requisição de redefinição de senha
servidor.post('/recuperacao-de-conta', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST recuperacao-de-conta, ip='+req.ip);
		//const db = await abrirBanco;
		//const usuarioExiste = await db.get(`SELECT id FROM Usuarios WHERE email = (?);`, [body.email]);
		const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE email = (?);`, [body.email]);
		if (!usuarioExiste) {
			console.log('Conta não encontrada.');
			return resp.status(404).json({erro: 'Conta não encontrada.'});
		}
		//remove requisições anteriores, caso haja
		//await db.run(`DELETE FROM RecuperacoesDeConta WHERE idDoUsuario = ${usuarioExiste.id};`);
		await pool.query(`DELETE FROM recuperacao_de_conta WHERE id_do_usuario = '${usuarioExiste.id}';`);
		const uuidDoToken = uuidv4();
		const uuidDoTokenHash = await bcrypt.hash(uuidDoToken, BCRYPT_SALT_ROUNDS);
		//const dataDeExpiracao = Date.now() + DURACAO_DO_TOKEN_DE_RECUPERACAO;
		//await db.run(//renomear token aki
		//	`INSERT INTO RecuperacoesDeConta (idDoUsuario, token, dataDeExpiracao)
		//	VALUES (${usuarioExiste.id}, '${uuidDoTokenHash}', ${dataDeExpiracao});`
		//);
		await pool.query(
			`INSERT INTO recuperacao_de_conta (id, id_do_usuario, hash_do_token)
			VALUES ('${uuidDoToken}', '${usuarioExiste.id}', '${uuidDoTokenHash}');`
		);
		const emailEnviado = await enviarEmail(body.email, 'Redefinição de senha',
			`<a href='http://localhost:3000/redefinir-senha?token=${uuidDoToken}&id=${usuarioExiste.id}'>
				Redefinir senha
			</a>`
		);
		if (emailEnviado.erro)
			return resp.status(emailEnviado.status).json({erro: emailEnviado.erro});
		return resp.status(200).json({ok: 'E-mail enviado com sucesso.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

async function enviarEmail(email, assunto, texto) {
	try {
		//console.log('entrou em enviarEmail');
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL,
				pass: process.env.SENHA_DO_EMAIL,
				type: 'OAuth2',
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
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
		//console.log('passou d verify');
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
	//const db = await abrirBanco;
	//const usuarioExiste = await db.get(`SELECT id FROM Usuarios WHERE id = (?);`, [query.id]);
	const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE id = (?);`, [query.id]);
	if (!usuarioExiste) {
		console.log('Conta não encontrada.');
		return resp.status(404).json({erro: 'Conta não encontrada.'});
	}
	//const recuperacaoExiste = await db.get(
	//	`SELECT token, dataDeExpiracao FROM RecuperacoesDeConta WHERE idDoUsuario = (?);`, [query.id]
	//);
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
	//if(recuperacaoExiste.dataDeExpiracao < Date.now()) {
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
		//const db = await abrirBanco;
		//const usuarioExiste = await db.get(`SELECT id FROM Usuarios WHERE id = (?);`, [query.id]);
		const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE id = (?);`, [query.id]);
		if (!usuarioExiste) {
			console.log('Conta não encontrada.');
			return resp.status(404).json({erro: 'Conta não encontrada.'});
		}
		//const recuperacaoExiste = await db.get(
		//	`SELECT token, dataDeExpiracao FROM RecuperacoesDeConta WHERE idDoUsuario = (?);`, [query.id]
		//);
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
		//if(recuperacaoExiste.dataDeExpiracao < Date.now()) {
		if(recuperacaoExiste.dataDeCriacaoEmSeg*1000 + DURACAO_DO_TOKEN_DE_RECUPERACAO < Date.now()) {
			console.log('Redefinição de senha expirada.');
			return resp.status(401).json({erro: 'Redefinição de senha expirada.'});
		}
		return resp.status(200).json({ok: true});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
})

servidor.post('/redefinicao-de-senha', async (req, resp)=>{
	try {
		const body = req.body;
		console.log('POST redefinicao-de-senha, ip='+req.ip);
		//const db = await abrirBanco;
		//const usuarioExiste = await db.get(`SELECT id FROM Usuarios WHERE id = (?);`, [body.idDoUsuario]);
		const [[usuarioExiste]] = await pool.query(`SELECT id FROM usuario WHERE id = (?);`, [body.idDoUsuario]);
		if (!usuarioExiste) {
			console.log('Conta não encontrada.');
			return resp.status(404).json({erro: 'Conta não encontrada.'});
		}
		//const recuperacaoExiste = await db.get(
		//	`SELECT token, dataDeExpiracao FROM RecuperacoesDeConta WHERE idDoUsuario = ${body.idDoUsuario};`
		//);
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
		//if(recuperacaoExiste.dataDeExpiracao < Date.now()) {
		if(recuperacaoExiste.dataDeCriacaoEmSeg*1000 + DURACAO_DO_TOKEN_DE_RECUPERACAO < Date.now()) {
			console.log('Redefinição de senha expirada.');
			return resp.status(401).json({erro: 'Redefinição de senha expirada.'});
		}

		const novaSenhaHash = await bcrypt.hash(body.novaSenha, BCRYPT_SALT_ROUNDS);
		//await db.run(`UPDATE Usuarios SET senhaHash = '${novaSenhaHash}' WHERE id = ${body.idDoUsuario};`);
		await pool.query(`UPDATE usuario SET hash_da_senha = '${novaSenhaHash}' WHERE id = '${body.idDoUsuario}';`);
		//await db.run(`DELETE FROM RecuperacoesDeConta WHERE idDoUsuario = ${body.idDoUsuario};`);
		await pool.query(`DELETE FROM recuperacao_de_conta WHERE id_do_usuario = '${body.idDoUsuario}';`);
		return resp.status(200).json({ok: 'Senha redefinida com sucesso.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//exclui conta de usuário
servidor.delete('/usuarios/:idDoUsuario', async (req, resp)=>{
	try {
		const body = req.body;
		const idDoUsuario = req.params.idDoUsuario;
		//const id = parseInt(body.id);
		//console.log('DELETE usuarios/:id, id do usuário='+id+', ip='+req.ip);
		//const tokenDaSessao = body.tokenDaSessao;
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		console.log('DELETE usuarios/:idDoUsuario, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		if (sessaoExiste.idDoUsuario != idDoUsuario) //lembrete: é possível isso?
			return resp.status(409).json({erro: 'O token não pertence ao usuário informado.'});
		const usuarioExiste = await verificarCredenciais('', body.senha, sessaoExiste.idDoUsuario);
		if (usuarioExiste.erro)
			return resp.status(usuarioExiste.status).json({erro: usuarioExiste.erro});
		//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT id, tokenDaSessaoHash, dataDeExpiracao, idDoUsuario FROM Sessoes WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}

		const usuarioExiste = await db.get(
			`SELECT senhaHash FROM Usuarios WHERE id = ${sessaoExiste.idDoUsuario};`,
			function(erro) {
				console.log('quando isso é executado?? - buscando usuário');
				if (erro) {
					console.log('erro:');
					console.log(erro);
					return console.log(erro);
				}
				console.log(`A row has been inserted with rowid ${this.lastID}`);
				return this.lastID;
			}
		);
		if (!usuarioExiste) {
			console.log('Usuário não registrado.');
			return resp.status(404).json({erro: 'Usuário não registrado.'});
		}
		const senhaCorreta = await bcrypt.compare(body.senha, usuarioExiste.senhaHash);
		if (!senhaCorreta) {
			console.log('Senha incorreta.');
			return resp.status(200).json({erro: 'Senha incorreta.'});
		}*/
		
		////exclui os anúncios do usuário
		//const anuncios = await db.all(
		//	`SELECT idDoAnuncio FROM Anuncios WHERE idDoUsuario = ${sessaoExiste.idDoUsuario};`
		//);
		//const idsDosAnuncios = anuncios.map(a=>a.idDoAnuncio).join();
		//const disponibilidades = await db.all(
		//	`SELECT id FROM Disponibilidades WHERE idDoAnuncio IN (${idsDosAnuncios});`
		//);
		//const idsDasDisponibilidades = disponibilidades.map(d=>d.id).join();
		//if (anuncios.length > 0) {
		//	await db.run(`DELETE FROM Anuncios WHERE idDoUsuario = ${sessaoExiste.idDoUsuario};`);
		//	await db.run(`DELETE FROM Disponibilidades WHERE idDoAnuncio IN (${idsDosAnuncios});`);
		//	await db.run(
		//		`DELETE FROM DiasDasDisponibilidades WHERE idDaDisponibilidade IN (${idsDasDisponibilidades});`
		//	);
		//}
		////exclui as sessões do usuário
		//await db.run(`DELETE FROM Sessoes WHERE idDoUsuario = ${sessaoExiste.idDoUsuario};`);
		////exclui usuário
		//await db.run(`DELETE FROM Usuarios WHERE id = ${sessaoExiste.idDoUsuario};`);

		//todos os dados relacionados ao usuário estão referenciados por chave estrangeira, logo, basta excluí-lo
		await pool.query(`DELETE FROM usuario WHERE id = '${sessaoExiste.idDoUsuario}';`);

		console.log('Conta excluída, id='+sessaoExiste.idDoUsuario+'.');
		return resp.status(200).json({ok: 'Conta excluída.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

async function autenticarSessao(token){
	//console.log('entrou em autenticarSessao');
	try {
		const seletor = token.slice(0,8);
		const uuidDoToken = token.slice(9);
		//const db = await abrirBanco;
		//const sessaoExiste = await db.get(//renomear token aki
		//	`SELECT Sessoes.id, idDoUsuario, tokenDaSessaoHash, dataDeExpiracao, manterSessao,
		//		Usuarios.nome AS nomeDoUsuario
		//	FROM Sessoes JOIN Usuarios
		//	ON Sessoes.idDoUsuario = Usuarios.id
		//	WHERE seletor = '${seletor}';`
		//);
		const [[sessaoExiste]] = await pool.query(//renomear token aki
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
		//if(sessaoExiste.dataDeExpiracao < Date.now()) {
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
		//console.log('entrou no catch de autenticarSessao');
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

//function separarToken(token) {
//	return [token.slice(0,8), token.slice(9)];
//}

async function verificarCredenciais(nome, senha, id) {
	try {
		//const db = await abrirBanco;
		//const usuario = await db.get(
		//	`SELECT id, nome, senhaHash FROM Usuarios WHERE ${id ? `id = ${id}` : 'nome = (?)'};`, [nome]
		//);
		//let usuario;
		//if (id)
		//	usuario = await db.get(`SELECT id, nome, senhaHash FROM Usuarios WHERE id = (?);`, [id]);
		//else
		//	usuario = await db.get(`SELECT id, nome, senhaHash FROM Usuarios WHERE nome = (?);`, [nome]);

		//let usuario;
		//if (id)
		//	[usuario] = await pool.query(
		//		`SELECT id, nome_de_usuario AS nome, hash_da_senha AS senhaHash FROM usuario WHERE id = (?);`, [id]
		//	);
		//else
		//	[usuario] = await pool.query(
		//		`SELECT id, nome_de_usuario AS nome, hash_da_senha AS senhaHash FROM usuario
		//		WHERE nome_de_usuario = (?);`, [nome]
		//	);
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
		//console.log('entrou no catch de verificarCredenciais');
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
		//const db = await abrirBanco;
		//const usuarioExiste = await db.get(`SELECT * FROM Usuarios WHERE nome = '${body.nomeDoUsuario}';`);
		//const usuarioExiste = await db.get(
		//	`SELECT id,senhaHash,nome FROM Usuarios WHERE nome = (?);`,
		//	[body.nomeDoUsuario]
		//);
		//console.log('existe='+usuarioExiste);
		//if (!usuarioExiste) {
		//	console.log('Usuário não registrado.');
		//	return resp.status(404).json({erro: 'Usuário não registrado.'});
		//}
		//const senhaCorreta = await bcrypt.compare(body.senha, usuarioExiste.senhaHash);
		//if (!senhaCorreta) {
		//	console.log('Senha incorreta.');
		//	return resp.status(200).json({erro: 'Senha incorreta.'});
		//}
		//return resp.status(201).json({id: usuarioExiste.id, nome: usuarioExiste.nome});
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
		//console.log('seletor,token='+seletor+','+tokenDaSessao);
		const uuidDoTokenHash = await bcrypt.hash(uuidDoToken, BCRYPT_SALT_ROUNDS);
		//await db.run(//renomear token aki
		//	`INSERT INTO Sessoes (idDoUsuario, seletor, tokenDaSessaoHash, dataDeExpiracao, manterSessao)
		//	VALUES (${resposta.id}, '${seletor}', '${uuidDoTokenHash}', ${resposta.dataDeExpiracao},
		//		${resposta.manterSessao});`,
		//	//[tokenDaSessaoHash, token.id, daquiAUmMes],
		////const token = {id: usuarioExiste.id, nome: usuarioExiste.nome, token: uuidv4()};
		////await db.run(`INSERT INTO Sessoes (id, nome, token) VALUES (?,?,?);`,
		////	[token.id, token.nome, token.token],
		//	function(erro) {
		//		console.log('quando isso é executado?? - criando sessão');
		//		if (erro) {
		//			console.log('erro:');
		//			console.log(erro);
		//			return console.log(erro);
		//		}
		//		console.log(`A row has been inserted with rowid ${this.lastID}`);
		//		return this.lastID;
		//	}
		//);
		//const dataDeCriacao = (resposta.dataDeExpiracao - DURACAO_DO_TOKEN_DE_SESSAO)/1000;
		await pool.query(//renomear token aki
			`INSERT INTO sessao (id, id_do_usuario, seletor, hash_do_token, manter_sessao, data_de_expiracao)
			VALUES ('${uuidDoToken}', '${resposta.id}', '${seletor}', '${uuidDoTokenHash}', ${resposta.manterSessao},
			FROM_UNIXTIME(${resposta.dataDeExpiracao/1000}));`
		);
		console.log('Sessão criada.');
		return resp.status(201).json(resposta);
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//chamado ao carregar a página; autentica sessão e atualiza a data de expiração
//servidor.post('/sessoes', async (req, resp)=>{
servidor.put('/sessoes', async (req, resp)=>{
	try {
		//const body = req.body;
		//const tokenDaSessao = req.params.tokenDaSessao;
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		//const [seletor,token] = separarToken(req.params.tokenDaSessao);
		console.log('PUT sessoes, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT Sessoes.id, idDoUsuario, tokenDaSessaoHash, dataDeExpiracao, manterSessao,
				Usuarios.nome AS nomeDoUsuario
			FROM Sessoes JOIN Usuarios
			ON Sessoes.idDoUsuario = Usuarios.id
			WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}*/

		//const usuarioExiste = await db.get(`
		//	SELECT nome FROM Usuarios WHERE id = ${sessaoExiste.idDoUsuario};`
		//);
		//const novoToken = await atualizarSessao(sessao.id);
		//if (novoToken.erro) throw novoToken.erro;

		//atualizando token:
		/*const novoTokenDaSessao = uuidv4();
		const resposta = {
			id: sessaoExiste.idDoUsuario,
			//nome: usuarioExiste.nome,
			nome: sessaoExiste.nomeDoUsuario,
			tokenDaSessao: sessaoExiste.seletor + '-' + novoTokenDaSessao,
			//tokenDaSessao: seletor + '-' + novoToken.novoTokenDaSessao,
			dataDeExpiracao: Date.now() + DURACAO_DO_TOKEN_DE_SESSAO,
			//dataDeExpiracao: novoToken.dataDeExpiracao,
			manterSessao: sessaoExiste.manterSessao
		};
		const novoTokenDaSessaoHash = await bcrypt.hash(novoTokenDaSessao, BCRYPT_SALT_ROUNDS);
		//resposta.dataDeExpiracao = Date.now() + duracaoDoTokenDeSessao;
		await db.run(`
			UPDATE Sessoes
			SET tokenDaSessaoHash = '${novoTokenDaSessaoHash}', dataDeExpiracao = ${resposta.dataDeExpiracao}
			WHERE id = ${sessaoExiste.id};`,
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
		// */

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
		//await db.run(
		//	`UPDATE Sessoes SET dataDeExpiracao = ${resposta.dataDeExpiracao} WHERE id = ${sessaoExiste.id};`
		//);
		// */
		await pool.query(
			`UPDATE sessao SET data_de_expiracao = FROM_UNIXTIME(${resposta.dataDeExpiracao/1000})
			WHERE id = '${sessaoExiste.id}';`
		);
		console.log('Sessão autenticada e atualizada.');
		return resp.status(200).json(resposta);
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//chamado ao deslogar; exclui a sessão do dispositivo atual
servidor.delete('/sessoes', async (req, resp)=>{
	try {
		//const body = req.body;
		//const tokenDaSessao = req.params.tokenDaSessao;
		//const seletor = body.tokenDaSessao.slice(0,8);
		//const tokenDaSessao = body.tokenDaSessao.slice(9);
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		//const [seletor,token] = separarToken(req.params.tokenDaSessao);
		console.log('DELETE sessoes, ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT id, tokenDaSessaoHash, dataDeExpiracao FROM Sessoes WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}*/

		//await db.run(`DELETE FROM Sessoes WHERE id = ${sessaoExiste.id};`);
		await pool.query(`DELETE FROM sessao WHERE id = '${sessaoExiste.id}';`);
		console.log('Sessão excluída.');
		return resp.status(200).json({ok: 'Sessão excluída.'});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

//exclui todas as outras sessões do mesmo usuário e retorna o número de sessões excluídas
//lembrete: criar rota que retorna informações dos outros dispositivos conectados
//servidor.delete('/outras-sessoes/:idDoUsuario', async (req, resp)=>{
servidor.delete('/usuarios/:idDoUsuario/outras-sessoes', async (req, resp)=>{
	try {
		//const body = req.body;
		const idDoUsuario = req.params.idDoUsuario;
		//const [seletor,token] = separarToken(req.params.tokenDaSessao);
		//const tokenDaSessao = req.params.tokenDaSessao;
		//const seletor = tokenDaSessao.slice(0,8);
		//const token = tokenDaSessao.slice(9);
		console.log('DELETE outras-sessoes/:idDoUsuario, id do usuário='+idDoUsuario+', ip='+req.ip);
		const sessaoExiste = await autenticarSessao(req.get('Authorization'));
		if (sessaoExiste.erro)
			return resp.status(sessaoExiste.status).json({erro: sessaoExiste.erro});
		//const db = await abrirBanco;
		/*const sessaoExiste = await db.get(
			`SELECT id, tokenDaSessaoHash, dataDeExpiracao FROM Sessoes WHERE seletor = '${seletor}';`
		);
		if (!sessaoExiste) {
			console.log('Sessão inexistente.');
			return resp.status(401).json({erro: 'Sessão inexistente.'});
		}
		if(sessaoExiste.dataDeExpiracao < Date.now()) {
			console.log('Sessão expirada.');
			return resp.status(401).json({erro: 'Sessão expirada.'});
		}
		const sessaoValida = await bcrypt.compare(token, sessaoExiste.tokenDaSessaoHash);
		if (!sessaoValida) {
			console.log('Sessão inválida.');
			return resp.status(401).json({erro: 'Sessão inválida.'});
			//cookie roubado? oq deve ser feito nesse caso?
		}*/

		//const sessoesConectadas = await db.get(
		//	`SELECT COUNT(*) AS qtde FROM Sessoes
		//	WHERE idDoUsuario = ${idDoUsuario} AND seletor != '${sessaoExiste.seletor}'
		//	AND dataDeExpiracao > ${Date.now()};`
		//);
		const [[sessoesConectadas]] = await pool.query(
			`SELECT COUNT(*) AS qtde FROM sessao
			WHERE id_do_usuario = '${idDoUsuario}' AND seletor != '${sessaoExiste.seletor}'
			AND data_de_expiracao > FROM_UNIXTIME(${Date.now()/1000});`
		);
		//if (!qtde)
		//	qtde = 0;
		//await db.run(`DELETE FROM Sessoes WHERE idDoUsuario = ${idDoUsuario} AND seletor != '${sessaoExiste.seletor}';`);
		await pool.query(`DELETE FROM sessao WHERE id_do_usuario = '${idDoUsuario}' AND seletor != '${sessaoExiste.seletor}';`);
		console.log('Sessões desconectadas='+sessoesConectadas.qtde+'.');
		return resp.status(200).json({qtdeSessoesDesconectadas: sessoesConectadas.qtde});
	}
	catch (erro) {
		//console.log('entrou no catch');
		console.log(erro);
		return resp.status(500).json({erro: 'Erro interno no servidor.'});
	}
});

servidor.listen(process.env.PORTA_DO_SERVIDOR, ()=>console.log('iniciou server, ouvindo porta '+process.env.PORTA_DO_SERVIDOR));