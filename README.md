1. What is JSX, and why is it used?

JSX  is a syntax that lets you write HTML-like code inside JavaScript.
It makes React components easier to read and write UI.

2. Difference between State and Props
Props → Passed from parent to child (read-only)
State → Managed inside a component (can change)

3. What is useState hook, and how does it work?
useState is a React hook used to create and manage state in functional components.
current state value function to update it.
Example:
const [count, setCount] = useState(0);

4. How can you share state between components?
Lift state up to a common parent
Pass it via props to child components Or use Context API / state management tools.

5. How is event handling done in React?
Using camelCase event names and functions.
Example:
<button onClick={handleClick}>Click</button>