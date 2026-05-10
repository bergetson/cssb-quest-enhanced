import { useGame } from '../contexts/GameContext';
import TitleScreen from './screens/TitleScreen';
import RegisterScreen from './screens/RegisterScreen';
import HubScreen from './screens/HubScreen';
import MissionScreen from './screens/MissionScreen';
import ResultScreen from './screens/ResultScreen';
import StoreScreen from './screens/StoreScreen';
import NotebookScreen from './screens/NotebookScreen';
import CertificateScreen from './screens/CertificateScreen';
import SecretScreen from './screens/SecretScreen';
import RolesScreen from './screens/RolesScreen';
import RefScreen from './screens/RefScreen';
import CalcScreen from './screens/CalcScreen';
import DailyScreen from './screens/DailyScreen';
import MinigameScreen from './screens/MinigameScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

export default function GameShell() {
  const { state } = useGame();

  const screens: Record<string, React.ReactNode> = {
    title: <TitleScreen />,
    register: <RegisterScreen />,
    hub: <HubScreen />,
    mission: <MissionScreen />,
    result: <ResultScreen />,
    store: <StoreScreen />,
    notebook: <NotebookScreen />,
    certificate: <CertificateScreen />,
    secret: <SecretScreen />,
    roles: <RolesScreen />,
    ref: <RefScreen />,
    calc: <CalcScreen />,
    daily: <DailyScreen />,
    minigame: <MinigameScreen />,
    leaderboard: <LeaderboardScreen />,
  };

  return (
    <div className="min-h-screen bg-background">
      {screens[state.screen] || <TitleScreen />}
    </div>
  );
}
