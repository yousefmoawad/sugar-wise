import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

// ==========================================
// 1. MINI GAME: MEDICAL MEMORY MATCH
// ==========================================

const initialCards = [
  { id: 1, icon: "fa-heart", color: "text-[#8EC641]" },
  { id: 2, icon: "fa-brain", color: "text-[#2DA1D7]" },
  { id: 3, icon: "fa-lungs", color: "text-[#8EC641]" },
  { id: 4, icon: "fa-user-md", color: "text-[#2DA1D7]" },
  { id: 5, icon: "fa-pills", color: "text-[#8EC641]" },
  { id: 6, icon: "fa-syringe", color: "text-[#2DA1D7]" },
];

/**
 * [GAME]: MemoryGame
 * Logic: Card matching game using medical icons.
 * Styling: Uses Primary Blue (#2DA1D7) theme.
 */
const MemoryGame = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);

  const shuffleCards = useCallback(() => {
    const deck = [...initialCards, ...initialCards]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, uniqueId: Math.random() }));

    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  }, []);

  useEffect(() => {
    shuffleCards();
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, [shuffleCards]);

  const handleClick = (id) => {
    if (disabled || flipped.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    setFlipped([flipped[0], id]);
    setDisabled(true);
    setMoves((prev) => prev + 1);

    const firstCard = cards.find((c) => c.uniqueId === flipped[0]);
    const secondCard = cards.find((c) => c.uniqueId === id);

    if (firstCard.id === secondCard.id) {
      setSolved([...solved, firstCard.uniqueId, secondCard.uniqueId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          <i className="fas fa-puzzle-piece mr-3 text-[#2DA1D7]"></i>{t("EducationalGames.MenuMemoryTitle")}
        </h3>
        <div className="text-sm font-black bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 text-[#2DA1D7] px-4 py-2 rounded-full uppercase tracking-widest transition-colors">
          {t("EducationalGames.GameMemoryMoves")} {moves}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {cards.map((card) => (
          <div
            key={card.uniqueId}
            onClick={() =>
              !solved.includes(card.uniqueId) && handleClick(card.uniqueId)
            }
            className={`
              aspect-square rounded-2xl cursor-pointer flex items-center justify-center text-3xl transition-all duration-500 transform
              ${
                flipped.includes(card.uniqueId) ||
                solved.includes(card.uniqueId)
                  ? "bg-gray-50 dark:bg-gray-900 border-2 border-[#2DA1D7]/30 rotate-0"
                  : "bg-gradient-to-br from-[#2DA1D7] to-[#1e7ca8] rotate-y-180 shadow-lg hover:scale-105"
              }
            `}
          >
            {flipped.includes(card.uniqueId) ||
            solved.includes(card.uniqueId) ? (
              <i className={`fas ${card.icon} ${card.color} text-4xl`}></i>
            ) : (
              <i className="fas fa-question text-white opacity-40"></i>
            )}
          </div>
        ))}
      </div>

      {solved.length === cards.length && cards.length > 0 && (
        <div className="mt-8 animate-bounce">
          <p className="text-[#8EC641] font-black text-xl mb-4 uppercase tracking-tighter">
            {t("EducationalGames.GameMemorySuccess")}
          </p>
          <button
            onClick={shuffleCards}
            className="bg-[#2DA1D7] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#2DA1D7]/20 hover:shadow-[#2DA1D7]/40 transition"
          >
            {t("EducationalGames.GameMemoryBtn")}
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MINI GAME: HEALTH TRIVIA
// ==========================================

/**
 * [GAME]: TriviaGame
 * Logic: Multiple choice quiz on diabetes and health.
 * Styling: Uses Brand Green (#8EC641) theme.
 */
const TriviaGame = () => {
  const { t } = useTranslation();
  const questions = [
    {
      question: t("EducationalGames.TriviaQ1"),
      options: [t("EducationalGames.TriviaQ1O1"), t("EducationalGames.TriviaQ1O2"), t("EducationalGames.TriviaQ1O3"), t("EducationalGames.TriviaQ1O4")],
      answer: 1,
    },
    {
      question: t("EducationalGames.TriviaQ2"),
      options: [t("EducationalGames.TriviaQ2O1"), t("EducationalGames.TriviaQ2O2"), t("EducationalGames.TriviaQ2O3"), t("EducationalGames.TriviaQ2O4")],
      answer: 2,
    },
    {
      question: t("EducationalGames.TriviaQ3"),
      options: [t("EducationalGames.TriviaQ3O1"), t("EducationalGames.TriviaQ3O2"), t("EducationalGames.TriviaQ3O3"), t("EducationalGames.TriviaQ3O4")],
      answer: 2,
    },
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswer = (index) => {
    if (index === questions[currentQ].answer) {
      setScore(score + 1);
    }
    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      setCurrentQ(nextQ);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-center transition-colors duration-300">
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center uppercase tracking-tight">
        <i className="fas fa-graduation-cap mr-3 text-[#8EC641]"></i> {t("EducationalGames.MenuTriviaTitle")}
      </h3>

      {showScore ? (
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-[#8EC641]/10 dark:bg-[#8EC641]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-colors shadow-inner">
            <i className="fas fa-trophy text-[#8EC641] dark:text-[#8EC641] text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {t("EducationalGames.GameTriviaScore", { score: score, total: questions.length })}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 font-medium">{t("EducationalGames.GameTriviaSuccess")}</p>
          <button
            onClick={resetQuiz}
            className="mt-8 bg-[#8EC641] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#8EC641]/20 hover:shadow-[#8EC641]/40 transition"
          >
            {t("EducationalGames.GameTriviaBtn")}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-4 py-1.5 rounded-full">
              {t("EducationalGames.GameTriviaQuestion")} {currentQ + 1} / {questions.length}
            </span>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-6 leading-tight">
              {questions[currentQ].question}
            </h4>
          </div>
          <div className="space-y-4">
            {questions[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 dark:text-gray-200 hover:bg-[#8EC641]/5 dark:hover:bg-[#8EC641]/10 hover:border-[#8EC641]/30 transition-all flex items-center group"
              >
                <span className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 text-sm flex items-center justify-center mr-4 font-black text-gray-400 group-hover:bg-[#8EC641] group-hover:text-white transition-colors">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-lg font-bold">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. MINI TOOL: BREATHING EXERCISE
// ==========================================

/**
 * [TOOL]: BreathingApp
 * Logic: Timed breathing cycles (Inhale, Hold, Exhale).
 * Styling: Uses dynamic color gradients matching the brand spectrum.
 */
const BreathingApp = () => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(t("EducationalGames.PhaseReady")); 
  const [active, setActive] = useState(false);

  useEffect(() => {
    let interval;
    if (active) {
      const breatheCycle = () => {
        setPhase(t("EducationalGames.PhaseInhale"));
        setTimeout(() => {
          setPhase(t("EducationalGames.PhaseHold"));
          setTimeout(() => {
            setPhase(t("EducationalGames.PhaseExhale"));
          }, 2000); 
        }, 4000); 
      };

      breatheCycle();
      interval = setInterval(breatheCycle, 10000); 
    } else {
      setPhase(t("EducationalGames.PhaseReady"));
    }
    return () => clearInterval(interval);
  }, [active, t]);

  return (
    <div className="bg-gradient-to-br from-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] p-10 rounded-[2rem] shadow-2xl text-white text-center flex flex-col items-center justify-center h-full relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <i className="fas fa-wind text-[12rem] absolute -top-10 -left-10"></i>
      </div>

      <h3 className="text-2xl font-black mb-10 relative z-10 uppercase tracking-widest">{t("EducationalGames.GameBreathTitle")}</h3>

      <div className="relative w-56 h-56 flex items-center justify-center mb-12">
        <div
          className={`absolute rounded-full bg-white opacity-20 transition-all duration-[4000ms] ease-in-out ${
            phase === t("EducationalGames.PhaseInhale") ? "w-56 h-56" : "w-28 h-28"
          }`}
        ></div>
        <div
          className={`absolute rounded-full bg-white opacity-40 transition-all duration-[4000ms] ease-in-out ${
            phase === t("EducationalGames.PhaseInhale") ? "w-44 h-44" : "w-22 h-22"
          }`}
        ></div>
        <div className="relative z-10 text-3xl font-black uppercase tracking-tighter">{phase}</div>
      </div>

      <button
        onClick={() => setActive(!active)}
        className="bg-white dark:bg-gray-900 text-[#2DA1D7] dark:text-[#8EC641] px-12 py-4 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10 uppercase tracking-widest text-lg"
      >
        {active ? t("EducationalGames.GameBreathBtnStop") : t("EducationalGames.GameBreathBtnStart")}
      </button>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

/**
 * [COMPONENT]: EducationalGames
 * Purpose: Interactive learning center for users.
 * Navigation: Side-menu for game selection.
 */
const EducationalGames = () => {
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState("memory");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 pb-16 transition-colors duration-300">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">
            {t("EducationalGames.PageTitle")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 transition-colors font-medium">
            {t("EducationalGames.PageSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3 space-y-6" data-aos="fade-right">
            
            {/* Nav: Memory Match */}
            <button
              onClick={() => setSelectedGame("memory")}
              className={`w-full p-6 rounded-2xl flex items-center transition-all duration-300 ${
                selectedGame === "memory"
                  ? "bg-[#2DA1D7] text-white shadow-2xl shadow-[#2DA1D7]/30 scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors shadow-inner ${
                  selectedGame === "memory"
                    ? "bg-white text-[#2DA1D7]"
                    : "bg-[#2DA1D7]/10 text-[#2DA1D7]"
                }`}
              >
                <i className="fas fa-brain text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-black uppercase tracking-tight text-sm">{t("EducationalGames.MenuMemoryTitle")}</h3>
                <p className="text-xs opacity-70 font-medium">{t("EducationalGames.MenuMemoryDesc")}</p>
              </div>
            </button>

            {/* Nav: Health Trivia */}
            <button
              onClick={() => setSelectedGame("trivia")}
              className={`w-full p-6 rounded-2xl flex items-center transition-all duration-300 ${
                selectedGame === "trivia"
                  ? "bg-[#8EC641] text-white shadow-2xl shadow-[#8EC641]/30 scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors shadow-inner ${
                  selectedGame === "trivia"
                    ? "bg-white text-[#8EC641]"
                    : "bg-[#8EC641]/10 text-[#8EC641]"
                }`}
              >
                <i className="fas fa-question text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-black uppercase tracking-tight text-sm">{t("EducationalGames.MenuTriviaTitle")}</h3>
                <p className="text-xs opacity-70 font-medium">{t("EducationalGames.MenuTriviaDesc")}</p>
              </div>
            </button>

            {/* Nav: Breathing App */}
            <button
              onClick={() => setSelectedGame("breath")}
              className={`w-full p-6 rounded-2xl flex items-center transition-all duration-300 ${
                selectedGame === "breath"
                  ? "bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] text-white shadow-2xl scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors shadow-inner ${
                  selectedGame === "breath"
                    ? "bg-white text-[#2DA1D7]"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                }`}
              >
                <i className="fas fa-lungs text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-black uppercase tracking-tight text-sm">{t("EducationalGames.MenuBreathTitle")}</h3>
                <p className="text-xs opacity-70 font-medium">{t("EducationalGames.MenuBreathDesc")}</p>
              </div>
            </button>
          </div>

          <div className="lg:col-span-9" data-aos="fade-left">
            <div className="h-full min-h-[550px]">
              {selectedGame === "memory" && <MemoryGame />}
              {selectedGame === "trivia" && <TriviaGame />}
              {selectedGame === "breath" && <BreathingApp />}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default EducationalGames;