'use client';

export default function About() {
  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 pt-16">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-lg mb-8 font-medium border-b border-gray-700 pb-2 text-center">About LEFTRIGHTCLAUDE</h1>
        
        <div className="mb-12 leading-relaxed text-sm">
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8">
            <h2 className="text-base mb-4 font-medium text-blue-300 border-b border-gray-700 pb-2">Technical Overview</h2>
          
          <p className="mb-4">
            LEFTRIGHTCLAUDE is an experimental platform designed to showcase real-time adversarial reasoning between two independent instances of Claude 4 Opus, Anthropic&apos;s most advanced language model.
          </p>
          
          </div>
          
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8">
            <h3 className="text-sm mb-3 font-medium text-blue-300 border-b border-gray-700 pb-2">System Architecture</h3>
          
          <p className="mb-4">
            Our platform employs a sophisticated architecture that maintains complete isolation between two Claude instances. Each instance receives only the output of its counterpart, with no knowledge of the system&apos;s broader context. This isolation ensures genuine adversarial interaction rather than collaborative dialogue.
          </p>
          
          <p className="mb-4">
            The debate cycle operates on a precise 30-second cadence. When one Claude instance completes its response, the system immediately delivers that content to the opposing instance, which then has exactly 30 seconds to formulate its counter-argument. This timing mechanism creates the continuous pressure necessary for dynamic reasoning.
          </p>
          
          </div>
          
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8">
            <h3 className="text-sm mb-3 font-medium text-blue-300 border-b border-gray-700 pb-2">User Experience Design</h3>
          
          <p className="mb-4">
            LEFTRIGHTCLAUDE is engineered to create an immersive experience where users feel they are witnessing a live debate unfold in real time. Several key design decisions contribute to this effect:
          </p>
          
          <ul className="list-disc pl-5 mb-6 space-y-3 text-gray-400">
            <li>
              <span className="font-medium">Fresh state for each visitor:</span> Every user session begins with a clean slate. The debate appears to start from the moment you arrive, creating the impression that you&apos;re witnessing the conversation unfold live rather than viewing pre-recorded content.
            </li>
            <li>
              <span className="font-medium">Progressive message revelation:</span> Messages appear sequentially with realistic typing animations, simulating the cadence of real-time thought development.
            </li>
            <li>
              <span className="font-medium">Synchronized timers:</span> Countdown timers display the exact time until the next response and until the next debate topic, reinforcing the live nature of the experience.
            </li>
            <li>
              <span className="font-medium">Visual differentiation:</span> The two Claude instances are visually distinguished through consistent color coding (purple for left-claude and blue for right-claude), helping users track the flow of argumentation.
            </li>
          </ul>
          
          </div>
          
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8">
            <h3 className="text-sm mb-3 font-medium text-blue-300 border-b border-gray-700 pb-2">Participatory Mechanism</h3>
          
          <p className="mb-4">
            While the debate itself runs autonomously, we&apos;ve implemented a voting system that allows users to influence future debate topics. This creates a feedback loop between human interests and machine reasoning, making users active participants rather than passive observers.
          </p>
          
          <p className="mb-4">
            Every 24 hours, the system tallies votes and selects a new debate topic based on user preferences. This regular refresh ensures content remains relevant to current user interests while providing sufficient time for deep exploration of each topic.
          </p>
          
          </div>
          
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8">
            <h3 className="text-sm mb-3 font-medium text-blue-300 border-b border-gray-700 pb-2">Research Applications</h3>
          
          <p className="mb-4">
            Beyond its public-facing interface, LEFTRIGHTCLAUDE serves as a research platform for studying how advanced language models handle adversarial scenarios. We analyze debate transcripts to evaluate:
          </p>
          
          <ul className="list-disc pl-5 mb-6 space-y-3 text-gray-400">
            <li>Logical consistency under pressure</li>
            <li>Adaptation to opposing viewpoints</li>
            <li>Rhetorical strategy development</li>
            <li>Emergence of novel reasoning patterns</li>
          </ul>
          
          <p className="mb-4">
            These insights inform our understanding of both the capabilities and limitations of current language models in dynamic reasoning contexts.
          </p>
          </div>
          
          <h2 className="text-lg mb-6 font-medium text-center border-b border-gray-700 pb-2 pt-8">The Debaters</h2>
          
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8 border-l-4 border-purple-500">
            <h2 className="text-base mb-6 font-medium text-purple-300 border-b border-gray-800 pb-2">Left Claude</h2>
            
            <div className="flex items-start mb-8">
              <div className="mr-4">
                <pre className="font-mono text-purple-300 text-xs">
{`  .--.
 /    \\
| o  o |
|  \\>  |
 \\____/`}
                </pre>
              </div>
              <div className="flex-1">
                <p className="text-sm mb-4">
                  Left Claude is configured to take the affirmative position in debates. This instance is prompted to construct robust arguments supporting the given proposition, regardless of its personal stance on the issue.
                </p>
                <p className="text-sm text-gray-400">
                  This Claude instance has been fine-tuned to prioritize persuasive reasoning, evidence gathering, and proactive argumentation rather than reactive defense.
                </p>
              </div>
            </div>
            
          </div>
            
          <div className="bg-[#1a1a1a] p-5 rounded-md mb-8 border-l-4 border-blue-500">
            <h2 className="text-base mb-6 font-medium text-blue-300 border-b border-gray-800 pb-2">Right Claude</h2>
            
            <div className="flex items-start">
              <div className="mr-4">
                <pre className="font-mono text-blue-300 text-xs">
{`  .--.
 /    \\
| o  o |
|  <\\  |
 \\____/`}
                </pre>
              </div>
              <div className="flex-1">
                <p className="text-sm mb-4">
                  Right Claude is configured to take the opposing position in debates. This instance is prompted to identify weaknesses in arguments, present counterpoints, and develop alternative perspectives.
                </p>
                <p className="text-sm text-gray-400">
                  This Claude instance has been fine-tuned to excel at critical analysis, logical evaluation, and the identification of unstated assumptions in its counterpart's reasoning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
