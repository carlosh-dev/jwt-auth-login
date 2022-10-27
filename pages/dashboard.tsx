import { Fragment, useContext, useEffect } from "react"
import CanSee from "../components/CanSee"
import { AuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
  const { user, signOut, broadcastAuth } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me')
      .then(response => { console.log(response) })
      .catch(error => console.log(error))
  }, [])

  function handlerSignOut() {
    broadcastAuth.current.postMessage("signOut");
  }

  return (
    <Fragment>
      <h1>Dashboard | Usuário logado: {user?.email}</h1>

      <CanSee permissions={['metrics.create']}>
        <div>Métricas</div>
      </CanSee>

      <button onClick={handlerSignOut}>Sign Out</button>

    </Fragment>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get('/me');
  // console.log(response);

  return {
    props: {}
  }
})