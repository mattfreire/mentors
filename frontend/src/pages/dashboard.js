import { useRouter } from 'next/router';
import React, {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";
import Talk from "talkjs";
import {API_URL} from "../config";
import {SWRConfig} from "swr";

class Inbox extends React.Component {
  constructor(props) {
    super(props);
    // TalkJS only works in the browser; ensure we're not trying to load TalkJS when
    // prerendering the HTML in Node.
    if(process.browser) {
      this.session = this.makeTalkSession();
    }
    this.inboxContainerRef = React.createRef();
    this.state = {
      selectedClientId: null
    }
  }

  /**
   * Returns a Promise that resolves with a Talk.Session object. Loading TalkJS is asynchronous
   * because it fetches the TalkJS SDK from the TalkJS CDN after your site has loaded.
   *
   * In larger apps you'll probably want to put the Talk.Session instance in the state of a
   * component further up the hierarchy, or in some state management layer you may use. We
   * recommend just storing the Promise that resolves to the Talk.Session there, awaiting it every
   * time you need it. In practice this will still be instantaneous once TalkJS has loaded, so
   * there's no performance penalty.
   */
  async makeTalkSession() {
    const { user } = this.props
    await Talk.ready;
    const me = new Talk.User({
      id: user.id,
      name: user.first_name,
      photoUrl: user.profile_picture ? user.profile_picture : `https://avatars.dicebear.com/api/initials/${user.name}.svg`,
      role: "client"
    });
    return new Talk.Session({
      appId: "tIZMNNO1",
      me
    });
  }

  /**
   * Await TalkJS initialization and then create a chatbox. We do this in componentDidMount so
   * that we're sure that the HTML is there. componentDidMount() is not called when
   * server-side-rendering so we do not need to check for `process.browser` here like we did in
   * the constructor.
   */
  async componentDidMount() {
    const session = await this.session;
    const inbox = session.createInbox();
    inbox.mount(this.inboxContainerRef.current);
    inbox.on("conversationSelected", async conversation => {
      if (conversation.others && conversation.others.length > 0) {
        const client = conversation.others[0]
        this.setState({selectedClientId: client.id})
      } else {
        this.setState({selectedClientId: null})
      }
    })
  }

  createSession = async () => {
    const session = await this.session;
    const client = this.state.selectedClientId

    try {
      const date = new Date()
      const startTime = date.toTimeString()
      const body = {
        start_time: startTime,
        client
      }
      const apiRes = await fetch(`${API_URL}/api/sessions/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.accessToken}`,
        },
        body: JSON.stringify(body)
      });
      if (apiRes.status === 201) {
        const data = await apiRes.json();
        const conversation = session.getOrCreateConversation(
          Talk.oneOnOneId(
            this.props.user.id.toString(),
            this.state.selectedClientId.toString()
          )
        );
        await conversation.sendMessage(`I have started a session. You can join the session on this link: ${data.session_url}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  render() {
    return (
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-4 sm:px-0">
            <style jsx>{`
            .chat-container {
                height: 500px;
                width: 400px;
            }
            `}</style>
            <div className="chat-container" ref={this.inboxContainerRef}>loading inbox...</div>
          </div>
          {this.state.selectedClientId && (
            <div className="px-4 sm:px-0">
              <button onClick={this.createSession} className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded">
                Create Session
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }
}

function Dashboard({ accessToken }) {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext)
  // const { data: mentor} = useSWR(`${API_URL}/api/mentors/me/`)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <Inbox user={user} accessToken={accessToken} />
    </div>
  )
}

function DashboardPage({ fallback, accessToken }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Dashboard accessToken={accessToken} />
    </SWRConfig>
  )
}

export default DashboardPage;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/mentors/me/`;
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    }).then((res) => res.json());
  }
  const data = await fetcher(API);
  return {
    props: {
      protected: true,
      accessToken: cookies.access,
      fallback: {
        [API]: data
      }
    },
  }
}
