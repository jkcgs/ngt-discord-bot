module.exports = handler;

function handler(app) {
    // Just the root
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Hello!'
        });
    });
}