"use strict";

class VideoPlayer extends React.Component {

  constructor(props) {
    props.name = props.name || 'video' + Date.now();
    props.id = props.id || 'video' + Date.now();
    props.controls = typeof props.controls === 'undefined' ? true : props.controls;
    props.playEventPrefix = props.playEventPrefix || props.name;
    props.endEventPrefix = props.endEventPrefix || props.playEventPrefix;
    props.timeEventPrefix = props.timeEventPrefix || props.playEventPrefix;
    props.listenToEvents = props.listenToEvents || true;
    props.videoSrc = props.videoSrc || '';
    props.videoStart = props.videoStart || 0;
    props.videoEnd = props.videoEnd || 0;
    props.videoIndex = props.videoIndex || -1;
    props.loaderImagePath = props.loaderImagePath ||  '';
    props.showLoader = props.showLoader || false;
    super(props);  
    props.videoSrc = this.prepareVideoSource(props.videoSrc, props.videoStart, props.videoEnd);
    this.state = {videoSrc:props.videoSrc, index: this.props.videoIndex, showLoader: this.props.showLoader, videoStart:this.props.videoStart, videoEnd:this.props.videoEnd};
  }

  showLoader() {
    this.setState({showLoader: true});
  }

  hideLoader() {
    this.setState({showLoader: false});
  }
 
  playClip(event) {
    var videoSrc, end, start, timer, timercounter, index, self;
    self = this;
    end = event.clipData.end;
    start = event.clipData.start;
    index = event.clipData.index;
    videoSrc = event.clipData.src;
    videoSrc = this.prepareVideoSource(videoSrc, start, end);
    this.setState({videoSrc:videoSrc, index:index, videoStart: start, videoEnd: end});
    this.refs.video.src = videoSrc;
    if( event.clipData.autostart ) {
      timer = window.setInterval(function(){      
        timercounter++;
        if(self.refs.video.readyState == 4) {
          clearInterval(timer);
          self.refs.video.play();
        }
        else if(timercounter > 100) {
          clearInterval(timer);
        }
      }, 500);
    }
    this.refs.video.play;
  }

  videoEnded() {
    var newEvent = {};
    if(this.refs.video.currentTime >= this.state.videoEnd) {
      newEvent = new Event(this.props.endEventPrefix + '_video_end');
      newEvent.videoData = {videoId:this.props.id,index:this.state.index, videoObject: this}; 
      document.dispatchEvent(newEvent); 
    } 
  }

  prepareVideoSource(source,start,end){
    var videoSrc = source;
    videoSrc = videoSrc + '#t=' || '';
    videoSrc = start ? videoSrc + start : videoSrc + '0';
    videoSrc = end ? videoSrc + ',' + end : videoSrc;    
    return videoSrc;
  }

  videoProgressed(event) {
      var currentTime = this.refs.video.currentTime, newEvent;
      newEvent = new Event(this.props.endEventPrefix + '_video_timeupdate');
      newEvent.videoData = {videoId:this.props.id,index:this.state.index, videoObject: this, currentTime:currentTime}; 
      document.dispatchEvent(newEvent); 
  }

  componentDidMount() {
    document.addEventListener(this.props.playEventPrefix + '_videoclip_play' , this.playClip.bind(this));
    this.refs.video.addEventListener('pause', this.videoEnded.bind(this));
    this.refs.video.addEventListener('timeupdate', this.videoProgressed.bind(this));
  }

  renderLoaderAnimation() {
    if( this.props.loaderImagePath ) {
      return (
        <div className="loader-animation">
          <img src={this.props.loaderImagePath} />
        </div>
      );
    }
  }

  renderLoader() {
     if( this.state.showLoader ) {
       return (
          <div className="loader-overlay">
            {this.renderLoaderAnimation()}
          </div>
       );
     }
  }

  render() {
    this.props.class = this.props.class ? this.props.class + ' video-player' : 'video-player';
    return (
      <div className={this.props.class}>
          {this.renderLoader()}
          <video ref="video" name={this.props.name} id={this.props.id} controls={this.props.controls}>
            <source src={this.state.videoSrc} />              
          </video>
      </div>
    );
  }

}


