import { useState } from "react";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuthContext } from "@/contexts/AuthContext";
import { ChallengeCard } from "./ChallengeCard";
import { ChallengeChatDialog } from "./ChallengeChatDialog";
import { TrendingUp, Loader2 } from "lucide-react";

export const ChallengesList = () => {
  const { isAuthenticated } = useAuthContext();
  const { challenges, isLoading, joinChallenge, leaveChallenge, isJoining, isLeaving } = useChallenges();
  
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    id: string;
    title: string;
    emoji: string;
  } | null>(null);

  const handleOpenChat = (challenge: { id: string; title: string; emoji: string }) => {
    setSelectedChallenge(challenge);
    setChatOpen(true);
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          Активные челленджи
        </h3>

        {challenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-4xl mb-2">🎯</p>
            <p>Нет активных челленджей</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                id={challenge.id}
                title={challenge.title}
                description={challenge.description}
                emoji={challenge.emoji}
                endDate={challenge.end_date}
                goalDescription={challenge.goal_description}
                rewardCoins={challenge.reward_coins}
                rewardXp={challenge.reward_xp}
                participantsCount={challenge.participants_count || 0}
                isJoined={challenge.is_joined || false}
                onJoin={() => joinChallenge(challenge.id)}
                onLeave={() => leaveChallenge(challenge.id)}
                onOpenChat={() => handleOpenChat({
                  id: challenge.id,
                  title: challenge.title,
                  emoji: challenge.emoji
                })}
                isJoining={isJoining}
                isLeaving={isLeaving}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>

      {selectedChallenge && (
        <ChallengeChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          challengeId={selectedChallenge.id}
          challengeTitle={selectedChallenge.title}
          challengeEmoji={selectedChallenge.emoji}
        />
      )}
    </>
  );
};
