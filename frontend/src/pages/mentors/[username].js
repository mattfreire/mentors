import {useRouter} from 'next/router';
import React, {useContext, useState} from "react";
import { useStopwatch } from 'react-timer-hook';
import Talk from "talkjs";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";
import Link from "next/link";

class Chat extends React.Component {
    constructor(props) {
      super(props);
      // TalkJS only works in the browser; ensure we're not trying to load TalkJS when
      // prerendering the HTML in Node.
      if(process.browser) {
        this.session = this.makeTalkSession();
      }
      this.chatContainerRef = React.createRef();
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

      // this creates a conversation with just the current user in it.
      // add more `setParticipant` calls here to amend the conversation.
      const { mentor } = this.props
      const mentorTalkUser = new Talk.User({
        id: mentor.user.id,
        name: mentor.user.first_name,
        photoUrl: mentor.profile_picture,
        role: 'mentor',
      });

      const conversation = session.getOrCreateConversation(Talk.oneOnOneId(session.me, mentorTalkUser));
      conversation.setParticipant(session.me);
      conversation.setParticipant(mentorTalkUser);

      const inbox = session.createInbox(conversation);
      inbox.select(conversation)

      inbox.mount(this.chatContainerRef.current);
    }

    render() {
      return <div>
        {/* TalkJS fills the available height of the container */}
        <style jsx>{`
        .chat-container {
            height: 500px;
            width: 400px;
        }
        `}</style>
        <div className="chat-container" ref={this.chatContainerRef}>loading chat...</div>
      </div>;
    }
}

const MentorDetail = ({ mentor }) => {
  const router = useRouter();
  const {username} = router.query
  const {user, loading} = useContext(AuthContext)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <main className="">
      <div className="">
        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
          {/* Left column */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <section aria-labelledby="section-1-title">
              <h2 className="sr-only" id="section-1-title">
                {username}'s Profile
              </h2>
              <div className="rounded-lg bg-white overflow-hidden shadow">
                <div className="p-6">stuff about the mentor</div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="grid grid-cols-1 gap-4">
            <section aria-labelledby="section-2-title">
              <h2 className="sr-only" id="section-2-title">
                TalkJS
              </h2>
              <div className="rounded-lg bg-white overflow-hidden shadow">
                <div className="p-6">
                  <Chat user={user} mentor={mentor}/>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MentorDetail;

export async function getServerSideProps(context) {
  const {req, query} = context
  const {cookies} = req
  const {username} = query
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/mentors/${username}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    });
    if (apiRes.status === 200) {
      data = await apiRes.json();
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      mentor: data,
      protected: true,
      accessToken: cookies.access
    },
  }
}
