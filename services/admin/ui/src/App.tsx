import { useAuth0 } from "@auth0/auth0-react";
import { useIamFetch } from "./hooks";

console.log(import.meta.env.VITE_AWS_REGION);

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  const { fetch } = useIamFetch();
  const doHealthcheck = async () => {
    await fetch(`${import.meta.env.VITE_CATALOG_API_ROOT}/catalog/healthcheck`)
      .then((res) => res.json())
      .then((res) => console.log(res));
  };

  return (
    <>
      <h1>{isAuthenticated ? "hey" : "No"} Hey</h1>
      <h1 onClick={() => loginWithRedirect()}>IO Commerce</h1>
      {isAuthenticated ? (
        <button onClick={doHealthcheck}>Healthcheck</button>
      ) : null}
    </>
  );
}

export default App;
