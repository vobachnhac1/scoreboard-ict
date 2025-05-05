import React, { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector } from 'react-redux';

const Timer = () => {
  const configData = useSelector((state) => state.config);

  const [timeLeft, setTimeLeft] = useState(configData.matchTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const isHandlingRound = useRef(false);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startBreakTime = () => {
    setIsBreakTime(true);
    setBreakTimeLeft(configData.breakTime);
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setBreakTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsBreakTime(false);
          setIsRunning(false);
          setCurrentRound(currentRound + 1);
          setTimeLeft(configData.matchTime);
          isHandlingRound.current = false;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRoundComplete = () => {
    if (isHandlingRound.current) return;
    isHandlingRound.current = true;

    clearInterval(timerRef.current);

    if (currentRound < configData.rounds) {
      startBreakTime();
    } else {
      setIsRunning(false);
      isHandlingRound.current = false;
    }
  };

  const toggleTimer = () => {
    if (currentRound === configData.rounds && timeLeft === 0) {
      return;
    }

    if (isBreakTime) {
      if (isRunning) {
        clearInterval(timerRef.current);
        setIsRunning(false);
      } else {
        setIsRunning(true);
        timerRef.current = setInterval(() => {
          setBreakTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsBreakTime(false);
              setIsRunning(false);
              setCurrentRound(currentRound + 1);
              setTimeLeft(configData.matchTime);
              isHandlingRound.current = false;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (isRunning) {
        clearInterval(timerRef.current);
        setIsRunning(false);
      } else {
        setIsRunning(true);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleRoundComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(configData.matchTime);
    setCurrentRound(1);
    setIsBreakTime(false);
    setBreakTimeLeft(0);
    isHandlingRound.current = false;
  };

  useHotkeys('space', (e) => {
    e.preventDefault();
    toggleTimer();
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setTimeLeft(configData.matchTime);
  }, [configData.matchTime]);

  useEffect(() => {
    if (currentRound > configData.rounds) {
      setCurrentRound(1);
      resetTimer();
    }
  }, [configData.rounds]);

  const getStatusText = () => {
    if (currentRound === configData.rounds && timeLeft === 0) {
      return 'Kết thúc trận đấu';
    }
    if (isBreakTime) {
      return 'Thời gian nghỉ';
    }
    return isRunning ? 'Đang chạy' : 'Tắt';
  };

  return (
    <div className="flex flex-col justify-between">
      <div className="text-center bg-yellow-300 py-3 px-8 h-fit">
        <div>
          Hiệp {currentRound}/{configData.rounds}
        </div>
        <div className="text-5xl">{isBreakTime ? formatTime(breakTimeLeft) : formatTime(timeLeft)}</div>
      </div>
      <div className="text-center text-red-600 font-bold">Trạng thái: {getStatusText()}</div>
    </div>
  );
};

export default Timer;
