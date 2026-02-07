
import React, { useState } from 'react';
import { Header } from './components/Header';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { NavBar } from './components/NavBar';
import { useLearningAppLogic } from './hooks/hooks/useLearningAppLogic';
import { THEMES } from './styles/themes';
import { Toast } from './components/Toast';

// Tabs
import { MathView } from './components/tabs/MathView';
import { WordsView } from './components/tabs/WordsView';
import { GrammarView } from './components/tabs/GrammarView';
import { StoreView } from './components/tabs/StoreView';
import { AchievementsView } from './components/tabs/AchievementsView';

// Modals
import { OnboardingModal } from './components/modals/OnboardingModal';
import { RedEnvelopeModal } from './components/RedEnvelopeModal';

export default function App() {
  const { state, actions } = useLearningAppLogic();
  const activeTheme = THEMES[state.themeKey];

  // Modal Visibility State
  const [isNameModalOpen, setIsNameModalOpen] = useState(!localStorage.getItem('app_username'));

  return (
    <div className={`min-h-screen ${activeTheme.bg || 'bg-[#FFF9F0]'} pb-28 transition-colors duration-500`}>
      <Toast 
        message={state.toast.message} 
        type={state.toast.type} 
        isVisible={state.toast.show} 
        onClose={actions.hideToast} 
      />

      <CelebrationOverlay isVisible={state.showCelebration.show} points={state.showCelebration.points} type={state.showCelebration.type} />

      <Header balance={state.points} userName={state.userName} themeKey={state.themeKey} />

      <div className="max-w-5xl mx-auto pt-2 px-4 md:px-6">
        
        {state.activeTab === 'math' && (
          <MathView
            question={state.currentMathQuestion}
            difficulty={state.mathDifficulty}
            onChangeDifficulty={actions.setMathDifficulty}
            onCheckAnswer={actions.checkMathAnswer}
            onNextQuestion={actions.createNewMathQuestion}
            streak={state.subjectStats.math.consecutiveCorrect}
            bestStreak={state.subjectStats.math.bestStreak}
            accuracy={state.mathAccuracy}
            luckValue={state.mathLuckValue}
            envelopeCountdown={state.mathEnvelopeCountdown}
          />
        )}

        {state.activeTab === 'words' && (
          <WordsView
            words={state.words}
            onAnswer={actions.updateWordAfterAnswer}
            onReveal={actions.revealWordAnswer}
            onImport={actions.importWords}
            streak={state.subjectStats.word.consecutiveCorrect}
            bestStreak={state.subjectStats.word.bestStreak}
            accuracy={state.wordAccuracy}
            luckValue={state.wordLuckValue}
            envelopeCountdown={state.wordEnvelopeCountdown}
          />
        )}

        {state.activeTab === 'grammar' && (
          <GrammarView
            questions={state.grammarQuestions}
            onAnswer={actions.updateGrammarAfterAnswer}
            onImport={actions.importGrammar}
            streak={state.subjectStats.grammar.consecutiveCorrect}
            bestStreak={state.subjectStats.grammar.bestStreak}
            accuracy={state.grammarAccuracy}
            luckValue={state.grammarLuckValue}
            envelopeCountdown={state.grammarEnvelopeCountdown}
          />
        )}

        {state.activeTab === 'rewards' && (
          <StoreView
            rewards={state.rewards}
            balance={state.points}
            onRedeem={actions.redeemReward}
            theme={activeTheme}
          />
        )}

        {state.activeTab === 'achievements' && (
          <AchievementsView
            achievements={state.achievements}
            points={state.points}
            totalAnswered={state.totalAnswered}
            totalCorrect={state.totalCorrect}
            accuracy={state.accuracy}
            streak={state.consecutiveCorrect}
            bestStreak={state.bestStreak}
            envelopesOpened={state.envelopesOpened}
            luckValue={state.luckValue}
            userName={state.userName}
            subjectStats={state.subjectStats}
            transactions={state.transactions}
            words={state.words}
            familyId={state.syncFamilyId}
            syncPassword={state.syncPassword}
            syncStatus={state.syncStatus}
            syncConfigured={state.syncConfigured}
            lastSyncAt={state.lastSyncAt}
            onSetFamilyId={actions.setSyncFamilyId}
            onSetSyncPassword={actions.setSyncPassword}
            onCreateFamilyId={actions.createFamilyId}
            onSyncPull={actions.syncPull}
            onSyncPush={actions.syncPush}
            onDisconnect={actions.disconnectSync}
            onSetUserName={actions.setUserName}
            onSetWords={actions.setWords}
            onExport={actions.exportData}
            onImport={actions.importData}
            onRestoreBackup={actions.restoreFromBackup}
            backupUpdatedAt={state.backupUpdatedAt}
            notificationUrl={state.notificationUrl}
            onSetNotificationUrl={actions.setNotificationUrl}
            onReset={actions.resetData}
          />
        )}
      </div>

      <NavBar activeTab={state.activeTab} setActiveTab={actions.setActiveTab} themeKey={state.themeKey} />

      <RedEnvelopeModal
        reward={state.pendingEnvelope}
        onClaim={actions.claimEnvelope}
      />

      {/* Modals */}
      <OnboardingModal 
        isOpen={isNameModalOpen}
        userName={state.userName}
        setUserName={actions.setUserName}
        onStart={(name) => {
          actions.setUserName(name);
          actions.showToast('欢迎来到趣味学习乐园！', 'success');
          setIsNameModalOpen(false);
        }}
        theme={activeTheme}
      />

    </div>
  );
}
