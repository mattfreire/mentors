import {useRouter} from 'next/router';
import React, {useContext} from "react";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";
import {ClientChatbox} from "../../containers/ClientChatbox";


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
                  <ClientChatbox user={user} other={{
                    id: mentor.user.id,
                    first_name: mentor.user.first_name,
                    profile_picture: mentor.profile_picture
                  }}/>
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
