import { useEffect, useRef, useState } from "react";
import "./App.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function YtLazy({ videoId, root, className = "", onPlay, onStop }) {
  const iframeRef = useRef(null);
  const wrapRef = useRef(null);
  const onPlayRef = useRef(onPlay);
  const onStopRef = useRef(onStop);
  onPlayRef.current = onPlay;
  onStopRef.current = onStop;

  const embedUrl = () =>
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&playsinline=1&rel=0&fs=0&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${window.location.origin}`;

  useEffect(() => {
    const rootEl = root?.current ?? null;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.6) {
          if (!iframe.src) iframe.src = embedUrl();
          onPlayRef.current?.();
        } else if (iframe.src) {
          iframe.src = "";
          onStopRef.current?.();
        }
      },
      { root: rootEl, threshold: [0, 0.6, 1] },
    );

    observer.observe(iframe);
    return () => observer.disconnect();
  }, [root, videoId]);

  const unmute = () => {
    const iframe = iframeRef.current;
    const send = (func, args = []) =>
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*",
      );
    onPlayRef.current?.();
    send("unMute");
    send("setVolume", [100]);
    send("playVideo");
    wrapRef.current?.setAttribute("data-unmuted", "true");
  };

  return (
    <div ref={wrapRef} className={`yt-wrap ${className}`} data-unmuted="false">
      <a
        className="yt-link"
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open on YouTube"
      />
      <iframe
        ref={iframeRef}
        className="yt-embed"
        title="YouTube"
        src=""
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen={false}
      />
      <button className="yt-unmute" onClick={unmute} aria-label="Enable sound">
        <span>🔊</span> Sound
      </button>
    </div>
  );
}

function HumanGlitch({ root, src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const rootEl = root?.current;
    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.6) {
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
          try {
            video.currentTime = 0;
          } catch {
            /* ignore */
          }
        }
      },
      { root: rootEl, threshold: [0, 0.6, 1] },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [root]);

  return (
    <div className="spacer snap" aria-hidden="true">
      <div className="video-humanout">
        <video
          ref={videoRef}
          className="humanout-video"
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

function Ghosts({ ghostImgUrl }) {
  return (
    <div className="spacer snap" style={{ "--ghost-img": `url(${ghostImgUrl})` }}>
      <div className="ghosts">
        <div className="ghost" />
        <div className="ghost" />
        <div className="ghost" />
        <div className="ghost" />
        <div className="ghost" />
        <div className="ghost" />
      </div>
    </div>
  );
}

function Walker({ root, idleSrc, walkSrc }) {
  const sceneRef = useRef(null);
  const actorRef = useRef(null);
  const idleRef = useRef(null);
  const walkRef = useRef(null);

  useEffect(() => {
    const rootEl = root?.current;
    const scene = sceneRef.current;
    const actor = actorRef.current;
    const idle = idleRef.current;
    const walk = walkRef.current;

    const reset = () => {
      idle.pause();
      walk.pause();
      try {
        idle.currentTime = 0;
      } catch {
        /* ignore */
      }
      try {
        walk.currentTime = 0;
      } catch {
        /* ignore */
      }
      idle.classList.remove("is-hidden");
      actor.classList.remove("walking");
      walk.style.opacity = "";
      idle.onended = null;
    };

    const startWalk = () => {
      actor.classList.remove("walking");
      actor.classList.add("walking");
      walk.muted = true;
      walk.play().catch(() => {});
    };

    const play = () => {
      reset();
      idle.muted = true;
      idle.play().catch(() => {});
      idle.onended = () => {
        idle.classList.add("is-hidden");
        startWalk();
      };
    };

    const observer = new IntersectionObserver(
      ([entry]) =>
        entry?.isIntersecting && entry.intersectionRatio >= 0.6 ? play() : reset(),
      { root: rootEl, threshold: [0, 0.6, 1] },
    );

    observer.observe(scene);
    return () => {
      observer.disconnect();
      reset();
    };
  }, [root]);

  return (
    <div ref={sceneRef} className="spacer snap walker-scene" aria-hidden="true">
      <div className="walker-stage" aria-hidden="true">
        <video ref={idleRef} className="idle-video" muted playsInline preload="metadata">
          <source src={idleSrc} type="video/mp4" />
        </video>
        <div ref={actorRef} className="walker actor">
          <video
            ref={walkRef}
            className="walker-video"
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={walkSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}

function FullVideo({ src }) {
  return (
    <div className="spacer snap network-scene" aria-hidden="true">
      <video
        className="network-video"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="network-fade left" />
      <div className="network-fade right" />
      <div className="network-fade top" />
      <div className="network-fade bottom" />
    </div>
  );
}

function GhostLine({ images = [], videoSrc = "" }) {
  return (
    <div className="spacer snap ghostline" aria-hidden="true">
      <div className="ghost-row-wrap">
        <div className="ghost-row">
          <div className="ghost-chip" style={{ "--img": `url(${images[0]})` }} />
          <div className="ghost-chip" style={{ "--img": `url(${images[1]})` }} />
          <div className="ghost-chip" style={{ "--img": `url(${images[2]})` }} />
          <video
            className="ghost-midvideo"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="ghost-chip" style={{ "--img": `url(${images[3]})` }} />
          <div className="ghost-chip" style={{ "--img": `url(${images[4]})` }} />
          <div className="ghost-chip" style={{ "--img": `url(${images[5]})` }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const pageRef = useRef(null);
  const audioRef = useRef(null);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.muted = false;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      audio.play().finally(() => setShowPrompt(false));
    };

    audio
      .play()
      .then(() => {
        setShowPrompt(false);
        started = true;
      })
      .catch(() => {
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
      });

    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  const pauseBackgroundAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  };

  const resumeBackgroundAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" src={`${base}/audio/websitemusic.mp3`} />
      {showPrompt && <div className="prompt">Click to Start</div>}

      <main ref={pageRef} className="page">
        <section className="line snap">
          <p>“It was suddenly empty. Too empty.”</p>
        </section>

        <div className="spacer lonely snap" aria-hidden="true">
          <section className="line snap">
            <p>
              “Where do people actually go? It still feels wrong seeing my friends, my
              family, even my pet… trapped on a screen. Everywhere, flattened into this
              glass-smooth digital world.”
            </p>
          </section>
        </div>

        <Ghosts ghostImgUrl={`${base}/images/humanflicker.png`} />

        <section className="line snap">
          <p>“Until I am...”</p>
        </section>

        <HumanGlitch root={pageRef} src={`${base}/videos/human_glitch_1.mp4`} />

        <section className="line snap">
          <p>"becoming one..."</p>
        </section>

        <div className="spacer wash-white snap" />

        <section className="line snap whiteout">
          <p>2050 - A project got approved, deployed and everything restarted</p>
        </section>

        <section className="line snap whiteout">
          <p>A new revolution.</p>
        </section>

        <section className="line snap whiteout">
          <p>“It solved the problem everyone was whispering about like a curse: ”</p>
        </section>

        <section className="line snap whiteout">
          <p>"OVERPOPULATION”</p>
        </section>

        <div className="spacer wash-white-reverse snap" />

        <Walker
          root={pageRef}
          idleSrc={`${base}/videos/human_idletowalk.mp4`}
          walkSrc={`${base}/videos/human_walkloop_fixed.mp4`}
        />

        <section className="line snap">
          <p>
            Human stepping out of a physical body and into a fully interactive interface
            form, has become an everyday reality. Physical matter start to convert into
            digital matter.
          </p>
        </section>

        <FullVideo src={`${base}/videos/network.mp4`} />

        <section className="line snap">
          <p>
            Movement stopped being about streets, cars, and distance. Now it’s screens and
            connections.
          </p>
        </section>

        <FullVideo src={`${base}/videos/flash.mp4`} />

        <section className="line snap">
          <p>
            “People design the shape of their digital selves the way older generations chose
            outfits or built houses.”
          </p>
        </section>

        <FullVideo src={`${base}/videos/transform.mp4`} />

        <section className="line snap">
          <p>
            But the biggest change wasn’t aesthetic. It was power. This shift rewired what
            it means to govern and organize life. Because digital matter is copyable,
            editable, programmable… humanity suddenly had more to control than ever.
          </p>
        </section>

        <section className="line snap">
          <p>“Identities. Environments. Memories. Even laws, adjusted through code.”</p>
        </section>

        <GhostLine
          images={[
            `${base}/images/style_1.png`,
            `${base}/images/style_2.png`,
            `${base}/images/style_3.png`,
            `${base}/images/style_4.png`,
            `${base}/images/style_5.png`,
            `${base}/images/style_6.png`,
          ]}
          videoSrc={`${base}/videos/human_glitch_end.mp4`}
        />

        <section className="line snap">
          <p>
            “The everyday question is no longer just where you live,
            <br />
            but on which server, under which rules, and with which version of yourself”
          </p>
        </section>

        <section className="line snap">
          <p>In this world, the boundary between “online” and “offline” has disappeared</p>
        </section>

        <FullVideo src={`${base}/videos/end_glitch.mp4`} />

        <section className="credit snap">
          <p>"Protocol Nation", by Felicia Tiffany Hertada</p>
          <p>“Where you live is a server. Homes that load.”</p>
        </section>

        <div className="spacer snap network-scene">
          <div className="yt-box">
            <YtLazy
              root={pageRef}
              videoId="gt0YIVi72z4"
              onPlay={pauseBackgroundAudio}
              onStop={resumeBackgroundAudio}
            />
          </div>
        </div>
      </main>
    </>
  );
}
