import { useState } from 'react';
import { Button } from './button';
import { Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface ShareButtonProps {
  content: string;
  url: string;
  reportId: number;
}

// Extend Window interface to include Clerk
declare global {
  interface Window {
    Clerk?: {
      user?: {
        getExternalAccounts: () => Promise<Array<{ provider: string }>>;
        session?: {
          getToken: () => Promise<string>;
        };
      };
      openSignIn: (options: {
        appearance: {
          elements: { 
            socialButtonsBlockButton: string;
          };
        };
        afterSignInUrl: string;
      }) => Promise<void>;
    };
  }
}

export function ShareButton({ content, url, reportId }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectLinkedIn = async () => {
    try {
      if (!window.Clerk) {
        throw new Error('Clerk not initialized');
      }

      // Check for existing LinkedIn connection
      const externalAccounts = await window.Clerk.user?.getExternalAccounts();
      const hasLinkedIn = externalAccounts?.some(account => account.provider === 'linkedin');

      if (!hasLinkedIn) {
        // Open Clerk sign-in with LinkedIn strategy
        await window.Clerk.openSignIn({
          appearance: {
            elements: {
              socialButtonsBlockButton: "linkedin" // Only show LinkedIn button
            }
          },
          afterSignInUrl: window.location.href,
        });
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect LinkedIn account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!reportId) {
      toast({
        title: 'Error',
        description: 'Cannot share: Invalid report ID',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has LinkedIn connection
    const externalAccounts = await window.Clerk?.user?.getExternalAccounts();
    const hasLinkedIn = externalAccounts?.some(account => account.provider === 'linkedin');

    if (!hasLinkedIn) {
      toast({
        title: 'LinkedIn Account Required',
        description: 'Please connect your LinkedIn account to share research',
      });
      await connectLinkedIn();
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch('/api/social/linkedin/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, url, reportId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to share on LinkedIn');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Successfully shared to LinkedIn',
      });

      return data;
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to share on LinkedIn',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      variant="outline"
      size="sm"
      className="w-full sm:w-auto"
    >
      <Share className="mr-2 h-4 w-4" />
      {isSharing ? 'Sharing...' : 'Share on LinkedIn'}
    </Button>
  );
}