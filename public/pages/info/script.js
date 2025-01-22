const $ball = document.querySelector("#ball");

document.addEventListener("mousemove", (event) => {
    requestAnimationFrame(() => {
        renderBall(event.clientX, event.clientY);
    });
});
document.addEventListener("touchmove", (event) => {
    requestAnimationFrame(() => {
        renderBall(event.touches[0].clientX, event.touches[0].clientY);
    });
});

function renderBall(x, y) {
    const ballStyle = getComputedStyle($ball);
    const size = parseInt(ballStyle.width, 10);

    x -= size / 2;
    y -= size / 2;

    const headerSize = parseInt(getComputedStyle(document.querySelector("header")).height, 10);
    let android = 0;
    if(localStorage.getItem("isAndroid")) {
        android = 30;
    }
    const ballStyleShadow = 20;
    
    // Verificando se a bola está dentro dos limites da janela
    x = Math.max(ballStyleShadow, Math.min(window.innerWidth - size - ballStyleShadow, x));
    y = Math.max(ballStyleShadow, Math.min(window.innerHeight - size - headerSize - ballStyleShadow, y)) + android;

    $ball.style.left = `${x}px`;
    $ball.style.top = `${y}px`;
}