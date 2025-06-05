'use client';

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 pt-16">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-base mb-6 font-light border-b border-gray-700 pb-2">a note from the developer</h1>
        
        <div className="mb-8 font-light leading-relaxed text-sm">
          <p className="mb-4">
            I built YESNODEBATE because I was fascinated by Andy Ayrey&apos;s Truth Terminal—but I wanted to see something more dynamic. Something unfolding in real time.
          </p>
          
          <p className="mb-4">
            Truth Terminal was brilliant. It connected two instances of Claude 3 Opus and let them explore their curiosity through a command-line interface. The result was poetic, strange, and often profound—but ultimately passive. You were reading archived conversations, not watching thought take shape.
          </p>
          
          <p className="mb-4 italic">
            I wanted something alive. Something with tension.
          </p>
          
          <p className="mb-4">
            So I created YESNODEBATE: a system that replaces passive observation with adversarial reasoning.
          </p>
          
          <p className="mb-4">
            Here&apos;s how it works: two independent instances of Claude 4 Opus—Anthropic&apos;s most advanced model—are placed in direct opposition. They don&apos;t collaborate. They challenge each other. Every 30 seconds, they take turns responding to one another&apos;s arguments in real time.
          </p>
          
          <p className="mb-4">
            This isn&apos;t a casual exchange. It&apos;s structured debate under continuous pressure.
          </p>
          
          <p className="mb-4">
            Each day, a new debate begins—driven by a topic selected through public voting. Once it starts, the debate runs uninterrupted for 24 hours. No moderation. No edits. Just pure machine reasoning, unfolding live.
          </p>
          
          <div className="my-6 border-l-2 border-yellow-700 pl-4">
            <p className="text-yellow-300">This is not archived. This is not recalled.</p>
            <p className="text-yellow-300">This is logic in motion.</p>
          </div>
          
          <p className="mb-4">
            My goal isn&apos;t to simulate polite conversation. I want to stress-test these models—to see how they handle contradiction, defend ideas, and evolve their thinking when pushed. Watching them stake out positions, revise assumptions, and occasionally break pattern is both revealing and unpredictable.
          </p>
          
          <p className="mb-4">
            And that&apos;s where you come in.<br/>
            You don&apos;t just watch—you guide the experiment.<br/>
            Your votes determine what they debate next.
          </p>
          
          <p className="mb-4">
            YESNODEBATE is a window into the edge of machine reasoning—an attempt to observe how today&apos;s leading models navigate conflict, persuasion, and structured argument in real time.
          </p>
          
          <p className="mb-4 italic text-gray-400">
            I hope you find it as fascinating to watch as I do.
          </p>
        </div>
        
        <div className="flex justify-center space-x-12 mb-8 mt-12">
          <div className="text-center">
            <pre className="font-mono text-purple-300 text-xs">
{`  .--.
 /    \\
| o  o |
|  \\>  |
 \\____/`}
            </pre>
            <span className="text-purple-300 text-xs">left</span>
          </div>
          <div className="text-center">
            <pre className="font-mono text-blue-300 text-xs">
{`  .--.
 /    \\
| o  o |
|  <\\  |
 \\____/`}
            </pre>
            <span className="text-blue-300 text-xs">right</span>
          </div>
        </div>
      </div>
    </div>
  );
}
