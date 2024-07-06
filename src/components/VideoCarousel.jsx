import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger);
import { useRef, useState, useEffect } from 'react';
import { highlightsSlides } from '../constants'
import { pauseImg, playImg, replayImg } from '../utils';

export const VideoCarousel = () => {
    //Keep track of the current video
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    //video and indicator
    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false
    });

      // destructure the useState object
    const {isEnd, startPlay, videoId, 
        isLastVideo, isPlaying} = video;

    const [loadedData, setLoadedData] = useState([]);

    useGSAP(() => {
        gsap.to('#slider', {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: 'power2.inOut'
        })

        gsap.to('#video', {
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none'
            },
            onComplete: () => {
                setVideo((prev) => ({
                    ...prev,
                    startPlay: true,
                    isPlaying: true
                }))
            },
        })
    }, [isEnd, videoId]);

    useEffect(() => {
        if(loadedData.length > 3){
            if(!isPlaying) {
                videoRef.current[videoId].pause();
            }else{
                startPlay && videoRef.current[videoId].play();
            }
        }
    }, [startPlay, videoId, isPlaying, loadedData])
     
    const handleLoadedMetadata = (i, e) => setLoadedData(
        (prev) => [...prev, e])

    

    useEffect(() => {
      let currentProgress = 0;
      let span = videoSpanRef.current;
    
      if(span[videoId]){
        // animate the progress of the video
        let anim = gsap.to(span[videoId], {
            onUpdate: () => {
                const progress = Math.ceil(anim.progress() * 100);

                if(progress != currentProgress){
                    currentProgress = progress;

                    gsap.to(videoDivRef.current[videoId], {
                        width: window.innerWidth < 760
                        ? '10vw' //mobile
                        : window.innerWidth < 1200
                        ? '10vw' // tablet
                        : '4vw'  //laptop
                    })

                    gsap.to(span[videoId], {
                        width: `${currentProgress}%`,
                        backgroundColor: 'white'
                    })
                }
            },
            onComplete: () => {
                if(isPlaying){
                    gsap.to(videoDivRef.current[videoId], {
                        width: '12px'
                    })
                    gsap.to(span[videoId], {
                        backgroundColor: '#afafaf'
                    })
                }
            }
        });

        if(videoId === 0) {
            anim.restart();
        }

        const animUpdate = () => {
            anim.progress(videoRef.current[videoId].currentTime / 
                highlightsSlides[videoId].videoDuration
            )
        }   
          
        if(isPlaying){
            gsap.ticker.add(animUpdate)
        }else {
            gsap.ticker.remove(animUpdate)
        }
    }   
    }, [videoId, startPlay])
    
    const handleProcess = (type, i) => {
        switch (type){
            case 'video-end':
                setVideo((prev) => (
                    {...prev, 
                        isEnd: true,
                    videoId: i + 1 } ))
                    break;

            case 'video-last':
                setVideo((prev) => (
                    {...prev, 
                        isLastVideo: true, }))
                    break;

            case 'video-reset':
                setVideo((prev) => (
                    {...prev, 
                        isLastVideo: false,
                    videoId: 0 } ))
                    break;

            case 'play':
                setVideo((prev) => (
                    {...prev, 
                        isPlaying: !prev.isPlaying } ))
                    break; 

            case 'pause':
                setVideo((prev) => (
                    {...prev, 
                        isPlaying: !prev.isPlaying } ))
                    break;

            default:
                return video;
            
        }
    }

  return (
    <>
        <div className="flex items-center">
            {/* import highlightsSlides array from constants */}
            {
            highlightsSlides.map((list, i) => (
                <div key={list.id} id='slider' 
                className='sm:pr-20 pr-10'>
                    <div className='video-carousel_container'>
                        <div className='w-full h-full flex-center
                        rounded-3xl overflow-hidden bg-black'>
                            <video
                            id='video' playsInline={true}
                            preload='auto' muted 
                            className={`${
                                list.id === 2 && 'translate-x-44'}
                                poiner-events-none
                                `}
                            ref={(el)=>(videoRef.current[i]) = el}                           
                            onEnded={() => 
                                i !== 3
                                ? handleProcess('video-end', i)
                                : handleProcess('video-last')
                            }
                            onPlay={() => {
                                setVideo((prevVideo) => (
                                {...prevVideo, isPlaying: true}
                            ))
                            }}
                            onLoadedMetadata={(e) => 
                                handleLoadedMetadata(i, e)}
                            >
                                <source src={list.video}
                                type='video/mp4' />
                            </video>
                        </div>
                        <div className='absolute top-12 
                        left-[5%] z-10'>
                            {
                                list.textLists.map((text) => (
                                    <p key={text}
                                    className='md:text-2xl
                                    text-xl font-medium'>
                                        {text}
                                    </p>
                                ))
                            }
                        </div>
                    </div>
                </div>
            ))
            }
        </div>

        <div className="relative flex-center mt-10">
            <div className='flex-center py-5 px-7
            bg-gray-300 backdrop-blur rounded-full'>
                {
                videoRef.current.map((_, i) => (
                    <span 
                        key={i}
                        ref={(el) => (videoDivRef.current[i] = el)}
                        className='mx-2 w-3 h-3 bg-gray-200
                        rounded-full relative cursor-pointer'
                    >
                        <span 
                        className='absolute h-full w-full rounded-full'
                        ref={(el) => (videoSpanRef.current[i] = el)} />                       
                    </span>
                ) )
                }                
            </div>
            <button className="control-btn">
                <img src={isLastVideo ? replayImg : 
                        !isPlaying ? playImg : pauseImg} 
                    alt={isLastVideo ? 'replay' :
                        !isPlaying ? 'play' : 'pause'} 
                    onClick={isLastVideo 
                        ? () => handleProcess('video-reset') 
                        : !isPlaying 
                            ? () => handleProcess('play') 
                            : () => handleProcess('pause')
                    }
                />
            </button>
        </div>
    </>
  );
};

