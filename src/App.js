import React, { useEffect, useRef, useState } from 'react';
import './App.css';

//basic structure


import birdImg from "./images/bird.png";
import pipeTopImg from "./images/pipe-top.png";
import pipeBottomImg from "./images/pipe-bottom.png";

// Game constants
const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;
const PLAYER_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_VELOCITY = -12;
const PLAYER_SPEED = 6;
const PIPE_WIDTH = 70;
const GAP_HEIGHT = 150;
const PIPE_INTERVAL = 1800;
const PIPE_SPEED = 2.6;

function App() {

  const [player, setPlayer] = useState({
    x: 64,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    vy: 0
  });

  const [pipes, setPipes] = useState([]);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const keysRef = useRef({});
  const lastPipeTimeRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.key] = true;
      if (!running && (e.key === " " || e.key === "ArrowUp")) startGame();
    };

    const up = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [running]);

  function startGame() {
    setPlayer({
      x: 64,
      y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
      vy: 0
    });

    setPipes([]);
    setScore(0);
    setRunning(true);
    setGameOver(false);
    lastPipeTimeRef.current = performance.now();
  }

  useEffect(() => {
    let last = performance.now();

    function gameLoop(now) {
      last = now;

      if (running) {

        if (now - lastPipeTimeRef.current > PIPE_INTERVAL) {
          lastPipeTimeRef.current = now;
          const gapY = Math.random() * (GAME_HEIGHT - GAP_HEIGHT - 120) + 60;

          setPipes(prev => [
            ...prev,
            { x: GAME_WIDTH, gapY, passed: false }
          ]);
        }

        setPipes(prev =>
          prev
            .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
            .filter(pipe => pipe.x + PIPE_WIDTH > 0)
        );

        setPlayer(prev => {
          let vx = 0;
          if (keysRef.current["ArrowLeft"]) vx = -PLAYER_SPEED;
          if (keysRef.current["ArrowRight"]) vx = PLAYER_SPEED;

          let newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + vx));

          let vy = prev.vy;
          if (keysRef.current[" "] || keysRef.current["ArrowUp"]) {
            if (prev.vy > -6) vy = JUMP_VELOCITY;
          }

          vy += GRAVITY;
          let newY = prev.y + vy;

          if (newY < 0) newY = 0;
          if (newY + PLAYER_SIZE > GAME_HEIGHT) {
            newY = GAME_HEIGHT - PLAYER_SIZE;
          }

          return { x: newX, y: newY, vy };
        });

        pipes.forEach(pipe => {

          if (!pipe.passed && pipe.x + PIPE_WIDTH < player.x) {
            pipe.passed = true;
            setScore(prev => prev + 1);
          }

          const birdBox = {
            left: player.x,
            right: player.x + PLAYER_SIZE,
            top: player.y,
            bottom: player.y + PLAYER_SIZE
          };

          const topPipeBox = {
            left: pipe.x,
            right: pipe.x + PIPE_WIDTH,
            top: 0,
            bottom: pipe.gapY
          };

          const bottomPipeBox = {
            left: pipe.x,
            right: pipe.x + PIPE_WIDTH,
            top: pipe.gapY + GAP_HEIGHT,
            bottom: GAME_HEIGHT
          };

          if (checkCollision(birdBox, topPipeBox) || checkCollision(birdBox, bottomPipeBox)) {
            setRunning(false);
            setGameOver(true);
          }
        });
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);

  }, [running, pipes, player]);

  function checkCollision(a, b) {
    return !(
      a.left > b.right ||
      a.right < b.left ||
      a.top > b.bottom ||
      a.bottom < b.top
    );
  }

  return (
    <div className="game-wrapper">
      <h2>Flappy Bird — React Version</h2>

      <div className="game-box" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>

        {/* Bird */}
        <img
          src={birdImg}
          alt="bird"
          className="player"
          style={{
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            position: "absolute",
            left: player.x,
            top: player.y
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>

            <img
              src={pipeTopImg}
              alt="top-pipe"
              className="pipe"
              style={{
                position: "absolute",
                width: PIPE_WIDTH,
                height: pipe.gapY,
                left: pipe.x,
                top: 0
              }}
            />

            <img
              src={pipeBottomImg}
              alt="bottom-pipe"
              className="pipe"
              style={{
                position: "absolute",
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.gapY + GAP_HEIGHT),
                left: pipe.x,
                top: pipe.gapY + GAP_HEIGHT
              }}
            />
          </React.Fragment>
        ))}

        {/* Score */}
        <div className="score">Score: {score}</div>

        {!running && !gameOver && (
          <div className="overlay">Press Space or ↑ to Start</div>
        )}

        {gameOver && (
          <div className="overlay">
            <h3>Game Over</h3>
            <p>Your Score: {score}</p>
            <button onClick={startGame}>Restart</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
