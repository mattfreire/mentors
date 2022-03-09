import React from "react";
import Talk from "talkjs";
import {getProfilePicture} from "../utils/profilePic";
import {TALKJS_PROJECT_ID} from "../config";

export class ClientChatbox extends React.Component {
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
        photoUrl: getProfilePicture(user.profile_picture, user.name)
      })
      return new Talk.Session({
        appId: TALKJS_PROJECT_ID,
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
      const { other } = this.props
      const mentorTalkUser = new Talk.User({
        id: other.id,
        name: other.first_name,
        photoUrl: other.profile_picture ? other.profile_picture : `https://avatars.dicebear.com/api/initials/${other.name}.svg`,
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
