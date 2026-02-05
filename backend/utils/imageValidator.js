const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

// Cache the model to avoid reloading it on every request
let model = null;

const POSSIBLE_VEHICLES = [
    'minivan', 'sports car', 'convertible', 'limousine', 'jeep', 'landrover',
    'cab', 'taxi', 'racer', 'race car', 'moving van', 'trailer truck',
    'tow truck', 'fire engine', 'bus', 'minibus', 'recreational vehicle',
    'motor scooter', 'moped', 'motorcycle', 'snowmobile', 'tractor', 'tricycle',
    'bicycle', 'mountain bike', 'car wheel', 'traffic light', 'pickup', 'pickup truck',
    'beach wagon', 'station wagon', 'ambulance', 'police van', 'golfcart', 'go-kart'
];

/**
 * Loads the MobileNet model if not already loaded.
 */
async function loadModel() {
    if (!model) {
        console.log('[Image Validator] Loading MobileNet model...');
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log('[Image Validator] Model loaded.');
    }
    return model;
}

/**
 * Validates if the image contains a vehicle.
 * @param {string} imagePath - Relative path to the image
 * @returns {Promise<boolean>}
 */
exports.validateImageContent = async (imagePath) => {
    try {
        console.log(`[Image Validator] Analyzing image: ${imagePath}`);

        // Ensure model is loaded
        const net = await loadModel();

        // Read image file from disk
        const imageBuffer = fs.readFileSync(imagePath);

        // Decode image to Tensor
        const tfimage = tf.node.decodeImage(imageBuffer);

        // Classify
        const predictions = await net.classify(tfimage);

        // Clean up tensor memory
        tfimage.dispose();

        console.log('[Image Validator] Predictions:', JSON.stringify(predictions));

        // Validation Logic
        const isVehicle = predictions.some(p => {
            const className = p.className.toLowerCase();
            return POSSIBLE_VEHICLES.some(v => className.includes(v));
        });

        if (isVehicle) {
            console.log('[Image Validator] Vehicle DETECTED ✅');
            return true;
        } else {
            console.log('[Image Validator] NO Vehicle detected ❌');
        }

        return false;

    } catch (error) {
        console.error('[Image Validator] AI Error:', error);
        // Fallback: If AI fails, allow the upload to avoid blocking users due to technical errors
        // Or return false if you want strict security.
        return true;
    }
};
