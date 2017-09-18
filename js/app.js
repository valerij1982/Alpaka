'use strict';

var my_news = [
  {
    author: 'Саша Печкин',
    text: 'В четчерг, четвертого числа...',
	bigText: 'в четыре с четвертью часа четыре чёрненьких чумазеньких чертёнка чертили чёрными чернилами чертёж.'
  },
  {
    author: 'Просто Вася',
    text: 'Считаю, что $ должен стоить 35 рублей!',
	bigText: 'А евро 42!'
  },
  {
    author: 'Гость',
    text: 'Бесплатно. Скачать. Лучший сайт - http://localhost:3000',
	bigText: 'На самом деле платно, просто нужно прочитать очень длинное лицензионное соглашение'
  }
];

window.ee = new EventEmitter();

var Article = React.createClass({
  propTypes: {
    data: React.PropTypes.shape({
      author: React.PropTypes.string.isRequired,
      text: React.PropTypes.string.isRequired,
	  bigText: React.PropTypes.string.isRequired
    })
  },
  
  getInitialState: function(){
	  return {
		  visible: false,
		  rating: 0,
		  eshe_odno_svoistvo: 'qweqwe'
	  };
  },
  
  readmoreClick: function(e) {
	  e.preventDefault();
	  this.setState( {visible: true}, function(){
		  alert('Состояние изменилось');
	  } );
  },
  
  render: function() {
    var author = this.props.data.author;
    var text = this.props.data.text;
	var	bigText = this.props.data.bigText;
	var visible = this.state.visible;// считываем значение переменной из состояния компонента
	//console.log('render',this); //добавили console.log

    return (
      <div className='article'>
        <p className='news__author'>{author}:</p>
        <p className='news__text'>{text}</p>
		{/* для ссылки readmore: не показывай ссылку, если visible === true */}
		<a href="#" 
			onClick={this.readmoreClick} 
			className={'news_readmore ' + (visible ? 'none':'') } >
			Подробнее
		</a>
		{/* для большо текста: не показывай текст, если visible === false */}
		<p className={'news__big-text ' + (visible ? '':'none') }>{bigText}</p>
      </div>
    )
  }
});

var News = React.createClass({
  propTypes: {
    data: React.PropTypes.array.isRequired
  },
  
  getInitialState: function(){
	return{
		counter: 0
	};
  },
  
//  onTotalNewsClick: function(){
//	  this.setState( {counter: ++this.state.counter} );
//  },
  
  render: function() {
    var data = this.props.data;
    var newsTemplate;

    if (data.length > 0) {
      newsTemplate = data.map(function(item, index) {
        return (
          <div key={index}>
            <Article data={item} />
          </div>
        )
      })
    } else {
      newsTemplate = <p>К сожалению новостей нет</p>
    }

    return (
      <div className='news'>
        {newsTemplate}
        <strong 
			className={'news__count ' + (data.length > 0 ? '':'none') }
			>
			Всего новостей: {data.length}</strong>
      </div>
    );
  }
});

// --- добавили test input ---
var Add = React.createClass({

	getInitialState: function(){
		return{
			agreeNotChecked: true,
			authorIsEmpty: true,
			textIsEmpty: true
		};
	},
	
	componentDidMount: function(){ //ставим фокус в input
		ReactDOM.findDOMNode(this.refs.author).focus();
	},
	
	onFieldChange: function(fieldName, e){
		var next = {};
		if( e.target.value.trim().length > 0 ){
			next[fieldName] = false;
		} else {
			next[fieldName] = true;
		}
		this.setState(next);
	},
	
	onTextChange: function(e){
		if(e.target.value.trim().length > 0){
			this.setState( {textIsEmpty: false} )
		} else {
			this.setState( {textIsEmpty: true} )
		}
	},

	onCheckRuleClick: function(e){
		//ReactDOM.findDOMNode(this.refs.alert_button).disabled = !e.target.checked;
		this.setState( {agreeNotChecked: !this.state.agreeNotChecked} );
	},
	
	onBtnClickHandler: function(e){
		
		e.preventDefault();
		var textEl = ReactDOM.findDOMNode(this.refs.text);

		var author = ReactDOM.findDOMNode(this.refs.author).value;
		var text = textEl.value;
		
		var item = [{
			author: author,
			text: text,
			bigText: '...'
		}];
		
		window.ee.emit('News.add', item);
		
		textEl.value = '';
		this.setState({textIsEmpty: true});
		//alert(author + '\n' + text);
	},
	
	
	render: function(){
		var agreeNotChecked = this.state.agreeNotChecked;
		var authorIsEmpty = this.state.authorIsEmpty;
		var textIsEmpty = this.state.textIsEmpty;
		return (
			<form className='add cf'>
				<input type='text'
					className='add_author' 
					defaultValue=''
					placeholder='Ваше имя'
					ref='author'
					onChange = {this.onFieldChange.bind(this, 'authorIsEmpty')}
				/>
				<textarea
					className='add_text'
					defaultValue=''
					placeholder='Текст новости'
					ref='text'
					onChange = {this.onFieldChange.bind(this, 'textIsEmpty')}
				></textarea>
				<label cassName='add_checkrule'>
					<input type='checkbox' ref='checkrule' onChange={this.onCheckRuleClick}/> Я согласен с правилами
				</label>
				<button 
					className='add_btn'
					onClick={this.onBtnClickHandler}
					ref='alert_button'
					disabled={ (this.state.agreeNotChecked || this.state.authorIsEmpty || this.state.textIsEmpty) }
				>
					Добавить новость
				</button>
			</form>
		);
	}
})

/* example: how to get data from server(jquery)
componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
*/

var App = React.createClass({
	getInitialState: function(){
		return {
			news: my_news
		};
	},
	componentDidMount: function(){
		/* Слушай событие "Создана новость"
		если событие произошло, обнови this.state.news
		*/
		var self = this;
		window.ee.addListener('News.add', function(item){
			var nextNews = item.concat(self.state.news);
			self.setState({news: nextNews});
		});
	},

	componentWillUmnount: function(){
		 /* Больше не слушай событие "Создана новость" */
		 window.ee.removeListener('News.add');
	},
	render: function() {
		console.log('render');
		return (
		  <div className='app'>
			<Add />
			<h3>Новости</h3>
			<News data={this.state.news} />
		  </div>
		);
	}
});

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
