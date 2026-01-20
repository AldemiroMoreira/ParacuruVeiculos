CREATE TABLE IF NOT EXISTS propagandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    imagem_url VARCHAR(500) NOT NULL,
    link_destino VARCHAR(500) NOT NULL,
    localizacao ENUM('home_top', 'home_middle', 'sidebar', 'footer') DEFAULT 'home_middle',
    ativo BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO propagandas (titulo, imagem_url, link_destino, localizacao) VALUES 
('Seguro Auto', 'https://placehold.co/1200x200/007bff/ffffff?text=Melhor+Seguro+Auto+Aqui', '#', 'home_top'),
('Pneus em Promoção', 'https://placehold.co/800x200/28a745/ffffff?text=Troque+seus+Pneus+Agora', '#', 'home_middle'),
('Som Automotivo', 'https://placehold.co/300x600/ffc107/000000?text=Som+Potente', '#', 'sidebar');
