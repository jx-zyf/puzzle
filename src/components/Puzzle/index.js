import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import toastr from 'toastr';
import './index.css';

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2500",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

let puzzle_box_width;

const numConfig = {
    '3': 9,
    '4': 16,
    '5': 25,
};

class Puzzle extends Component {
    constructor() {
        super();
        this.state = {
            degree: '3',
            puzzles: [],
            time: 0,
            isStart: undefined,
        };
        this.timer = null;
    }

    componentDidMount() {
        const puzzle_box = ReactDOM.findDOMNode(this.refs.puzzle_box);
        if (puzzle_box) {
            puzzle_box_width = puzzle_box.offsetWidth;
        }
        this.init();
    }

    degreeChange = (e) => {
        this.setState({ degree: e.target.value });
        setTimeout(() => {
            this.init();
        }, 0);
    }

    init = () => {
        let arr = [];
        const { degree } = this.state;
        const num = numConfig[degree]
        for (let i = 1; i < num; i++ ) {
            arr.push(i);
        }
        arr = arr.sort(() => {
            return Math.random() - 0.5;
        });
        arr.push(-1);
        this.setState({ 
            puzzles: arr,
            time: 0,
            isStart: undefined,
        });
        clearInterval(this.timer);
    }

    start = () => {
        const { isStart } = this.state;
        this.setState({
            isStart: !isStart,
        })
        if (!isStart) {
            this.timer = setInterval(() => {
                this.setState((state) => ({
                    time: state.time + 1
                }));
            }, 1000);
        } else {
            clearInterval(this.timer);
        }
    }

    isSuccess = () => {
        const { puzzles, degree } = this.state;
        const num = numConfig[degree]
        const result = puzzles.slice(0, num - 1).every((item, index) => item === index + 1);
        return result;
    }

    itemClick = (curIndex) => {
        const { isStart } = this.state;
        const NUM = ~~this.state.degree;
        const newPuzzles = this.state.puzzles;
        const emptyIndex = newPuzzles.findIndex(item => item === -1);
        let topIndex = curIndex - NUM,
            rightIndex = curIndex + 1,
            bottomIndex = curIndex + NUM,
            leftIndex = curIndex - 1;
        if (isStart !== true) {
            toastr.warning('游戏尚未开始或游戏暂停中！');
            return;
        }
        if ([topIndex, bottomIndex].includes(emptyIndex)) {
            // 上、下
            newPuzzles[emptyIndex] = [newPuzzles[curIndex], newPuzzles[curIndex] = newPuzzles[emptyIndex]][0];
        } else if ((curIndex + 1) % NUM !== 1 && leftIndex === emptyIndex) {
            // 左 当前点击的方块不能是最左边的
            newPuzzles[emptyIndex] = [newPuzzles[curIndex], newPuzzles[curIndex] = newPuzzles[emptyIndex]][0];
        } else if ((curIndex + 1) % NUM !== 0 && rightIndex === emptyIndex) {
            // 右 当前点击的方块不能是最右边的
            newPuzzles[emptyIndex] = [newPuzzles[curIndex], newPuzzles[curIndex] = newPuzzles[emptyIndex]][0];
        } else {
            console.log('啥也不做！');
        }
        this.setState({
            puzzles: newPuzzles
        })
        setTimeout(() => {
            if (this.isSuccess()) {
                toastr["success"](`恭喜你！成功了！总共耗时 ${this.state.time} 秒！游戏即将重置！`);
                clearInterval(this.timer);
                setTimeout(() => {
                    this.init();
                }, 3000);
            }
        }, 100)
    }

    render() {
        const { puzzles, time, isStart, degree } = this.state;
        const txtConfig = {
            undefined: '开始',
            false: '继续',
            true: '暂停',
        }
        const widthConfig = {
            '3': '33.33%',
            '4': '25.00%',
            '5': '20.00%',
        }
        const itemStyle = { 
            width: widthConfig[degree], 
            lineHeight: `${puzzle_box_width * (widthConfig[degree].slice(0, 5)/100)}px` 
        };
        return (
            <div>
                <p>难度选择：
                <select onChange={this.degreeChange} className='select_box'>
                    <option value="3" checked>简单</option>
                    <option value="4">一般</option>
                    <option value="5">困难</option>
                </select>
                </p>
                <p className='time'>时间:<span>{time}</span>秒</p>
                <ul className='puzzle_box' ref='puzzle_box'>
                    {puzzles.map((item, index) => (
                        <li 
                            className={item === -1 ? 'puzzle_item empty' : 'puzzle_item'} 
                            key={item} 
                            onClick={() => this.itemClick(index)}
                            style={isStart !== true ? { cursor: 'not-allowed', ...itemStyle } : { ...itemStyle }}
                        >{item}</li>
                    ))}
                </ul>
                <button className='start_btn' onClick={this.start}>{txtConfig[isStart]}</button>
                <button className='reset_btn' onClick={this.init}>重置</button>
            </div>
        )
    }
}

export default Puzzle;