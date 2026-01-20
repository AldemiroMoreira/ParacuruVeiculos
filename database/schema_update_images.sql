CREATE TABLE IF NOT EXISTS anuncio_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anuncio_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
);
