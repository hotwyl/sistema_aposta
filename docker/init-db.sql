-- Script de inicialização do banco de dados MariaDB
-- Executado automaticamente na primeira execução do container

CREATE TABLE IF NOT EXISTS concursos (
  id VARCHAR(36) NOT NULL DEFAULT (UUID()),
  numero_concurso INT NOT NULL,
  tipo_loteria VARCHAR(20) NOT NULL DEFAULT 'lotofacil',
  data_sorteio DATE NOT NULL,
  numeros_sorteados JSON NOT NULL,
  premio_principal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  acumulou BOOLEAN NOT NULL DEFAULT FALSE,
  valor_acumulado DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX concursos_numero_tipo_unique (numero_concurso, tipo_loteria),
  INDEX concursos_tipo_loteria_idx (tipo_loteria),
  INDEX concursos_data_sorteio_idx (data_sorteio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS apostas (
  id VARCHAR(36) NOT NULL DEFAULT (UUID()),
  concurso_id VARCHAR(36) DEFAULT NULL,
  tipo_loteria VARCHAR(20) NOT NULL DEFAULT 'lotofacil',
  numeros JSON NOT NULL,
  quantidade_numeros INT NOT NULL,
  valor_aposta DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_favorita BOOLEAN NOT NULL DEFAULT FALSE,
  observacoes TEXT,
  data_aposta DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX apostas_tipo_loteria_idx (tipo_loteria),
  INDEX apostas_is_favorita_idx (is_favorita),
  INDEX apostas_data_aposta_idx (data_aposta),
  INDEX apostas_concurso_id_idx (concurso_id),
  CONSTRAINT fk_apostas_concurso FOREIGN KEY (concurso_id) REFERENCES concursos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
