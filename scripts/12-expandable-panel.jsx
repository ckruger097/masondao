import React,{Component,Text,View,TouchableOpacity} from 'react'; //Step 1

class Panel extends Component{
    constructor(props){
        super(props);

        this.state = {       //Step 3
            title       : props.title,
            expanded    : false
        };
    }

    toggle(){
        
    }


    render(){
        let icon = this.icons['down'];

        if(this.state.expanded){
            icon = this.icons['up'];   //Step 4
        }

        //Step 5
        return ( 
            <View >
                <View >
                    <Text>{this.state.title}</Text>
                    <TouchableOpacity
                        onPress={this.toggle.bind(this)}
                        underlayColor="#f1f1f1">
                        
                    </TouchableOpacity>
                </View>
                
                <View>
                    {this.props.children}
                </View>

            </View>
        );
    }
}
export default Panel;