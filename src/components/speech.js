import SpeechSynthesis from "./speechSynthesis";

export default class Speech extends React.Component {
  constructor(props) {
    super(props);

    this.play = this.play.bind(this);

    this.onend = this.onend.bind(this);
    this.onerror = this.onerror.bind(this);
  }
  setSpeechSynthesis = () => {
    this.speechSynthesis = new SpeechSynthesis(this.props);
    this.speechSynthesis.onend(this.onend);
    this.speechSynthesis.onerror(this.onerror);
  };
  play = () => {
    this.setSpeechSynthesis();
    this.speechSynthesis.speak();
  };
  stop = () => {
    this.speechSynthesis.cancel();
  };

  onend = () => {
    this.stop();
  };

  onerror = () => {
    this.stop();
  };

  render() {
    this.play();
    return <p>hello</p>;
  }
}
