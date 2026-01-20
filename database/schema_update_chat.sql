-- Messages Table
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(255), -- Optional grouping ID
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    anuncio_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id)
);
