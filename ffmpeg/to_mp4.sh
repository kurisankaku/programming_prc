ffmpeg -i 0001.mts -vcodec libx264 -ar 48000 -ab 128k -r 30000/1001 -fps_mode cfr -vf yadif=mode=0:parity=-1:deint=1 -f mp4 -bufsize 20000k -maxrate 25000k output.mp4
