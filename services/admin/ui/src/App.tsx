import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <h1 onClick={() => loginWithRedirect()}>IO Commerce</h1>
    </>
  )
}

export default App
