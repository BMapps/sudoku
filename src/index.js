module.exports =function solveSudoku(matrix) {
  // your solution
  let rows=[];
  let columns=[];
  let squares=[];
  let min=[];
  let proposals=[];
  for (let i=0;i<9;i++){
    rows[i]=[1,2,3,4,5,6,7,8,9];
    columns[i]=[1,2,3,4,5,6,7,8,9];
    squares[i]=[1,2,3,4,5,6,7,8,9];
    for (let j=0;j<9;j++){
      if (matrix[i][j]!=0) rows[i][matrix[i][j]-1]=0;
      if (matrix[j][i]!=0) columns[i][matrix[j][i]-1]=0;
      let k=Math.floor(j/3)+Math.floor(i/3)*3;
      let m=j%3+(i*3)%9;
      if (matrix[k][m]!=0) squares[i][matrix[k][m]-1]=0;
    }
  }
  for (let i=0;i<9;i++){
    rows[i]=rows[i].filter(function(value, index, arr){
      return value>0;});
    columns[i]=columns[i].filter(function(value, index, arr){
      return value>0;});
    squares[i]=squares[i].filter(function(value, index, arr){
      return value>0;});
    addToMin(min, new area(i, rows[i].length, "row")); 
    addToMin(min, new area(i, columns[i].length, "column"));  
    addToMin(min, new area(i, squares[i].length, "square"));
  }

  for (let i=0;i<9;i++){
    for (let j=0;j<9;j++){
      check(matrix, i, j, rows, columns, squares, min);      
    }
  }
  if (min.length<1) return matrix;
  matrix=propose(matrix, min, rows, columns, squares, proposals);
  return (matrix);
}
function addToMin(min, area){
  if (area.len<1) return;
  if (min.length==0){
    min.push(area);
    return;
  }
  for (let i=0;i<min.length;i++){
    if (min[i].len>=area.len){
      min.splice(i,0,area);
      return;
    }
  }
  min.push(area);
  return ;
}

function check(matrix, i, j, rows, columns,squares,min){  
  if (min.length<1) return true;
  if( matrix[i][j]==0){   
    let possible=rows[i].slice();
    possible=filter(possible, columns[j]);
    let sqIndex=Math.floor(i/3)*3+Math.floor(j/3);
    possible=filter(possible, squares[sqIndex]);    
    if (possible.length<1) return false;
    if (possible.length==1){
      matrix[i][j]=possible[0];
      rows[i].splice(rows[i].indexOf(possible[0]),1);
      columns[j].splice(columns[j].indexOf(possible[0]),1);
      squares[sqIndex].splice(squares[sqIndex].indexOf(possible[0]),1);
      replace(min, i, "row");
      replace(min, j, "column");
      replace(min, sqIndex, "square");      
      for (let k=0;k<9;k++){
        if (matrix[i][k]==0) {
          if (check(matrix, i, k, rows, columns,squares,min)==false) return false;
        }
        if (matrix[k][j]==0){
          if (check(matrix, k, j, rows, columns,squares,min)==false) return false;
        }        
      }
      for (let k=Math.floor(i/3)*3;k<Math.floor(i/3)*3+3;k++){
        for (let l=Math.floor(j/3)*3;l<Math.floor(j/3)*3+3;l++){
          if (matrix[k][l]==0){
            if (check(matrix, k, l, rows, columns,squares,min)==false)return false;
          }
        }
      }
    }
  }
  return true;
}

function filter(possible, array){
  for (let i=0;i<possible.length;i++){
    if (array.indexOf(possible[i])==-1){
      possible.splice(i,1);
      i--;
    }    
  }
  return possible;
}

function replace(min, index, type){
  for (let i=0;i<min.length;i++){
    if (min[i].index==index && min[i].type==type){
      min[i].len--;
      let temp=min[i];
      min.splice(i,1);     
      if( temp.len>0){
        addToMin(min, temp);
      }
      return;
    }
  }
}

function propose(matrix, min, rows, columns, squares, proposals){
  if (min[0].type=="row"){
      for (let i=0;i<9;i++){
        if (matrix[min[0].index][i]==0){
          let possible=rows[min[0].index].slice();
          possible=filter(possible,columns[i]);
          let sqIndex=Math.floor(min[0].index/3)*3+Math.floor(i/3);
          possible=filter(possible, squares[sqIndex]);          
          for (let j=0;j<possible.length;j++){
            proposals.unshift(new proposal(matrix, rows, columns, squares, min));
            let a=tryProposal(min[0].index,i,possible[j],matrix, min, rows, columns, squares, proposals);
            if (a==false){
              matrix=proposals[0].matrix;
              rows=proposals[0].rows;
              columns=proposals[0].columns;
              squares=proposals[0].squares;
              min=proposals[0].min;
              proposals.shift();
            }else {
              matrix=a;
              return matrix;
            }
          }
        }
      }
    }else if(min[0].type=="column") {
      for (let i=0;i<9;i++){
        if (matrix[i][min[0].index]==0){
          let possible= columns[min[0].index].slice();
          possible=filter(possible, rows[i]);
          let sqIndex=Math.floor(i/3)*3+Math.floor(min[0].index/3);        
          possible=filter(possible, squares[sqIndex]);          
          for (let j=0;j<possible.length;j++){
            proposals.unshift(new proposal(matrix, rows, columns, squares, min));
            let a=tryProposal(i,min[0].index,possible[j],matrix, min, rows, columns, squares, proposals);
            if (a==false){
              matrix=proposals[0].matrix;
              rows=proposals[0].rows;
              columns=proposals[0].columns;
              squares=proposals[0].squares;
              min=proposals[0].min;
              proposals.shift();
            }else {
              matrix=a;
              return matrix;
            }
          }
        }
      }  
    } else {    
      for (let i=0;i<9;i++){
        let x=Math.floor(min[0].index/3)*3+Math.floor(i/3);
        let y=(min[0].index%3)*3+i%3; 
        if (matrix[x][y]==0){
          let possible= squares[min[0].index].slice();
          possible=filter(possible, rows[x]);      
          possible=filter(possible, columns[y]);

          for (let j=0;j<possible.length;j++){
            proposals.unshift(new proposal(matrix, rows, columns, squares, min));
            let a=tryProposal(x,y,possible[j],matrix, min, rows, columns, squares, proposals);
            if (a==false){
              matrix=proposals[0].matrix;
              rows=proposals[0].rows;
              columns=proposals[0].columns;
              squares=proposals[0].squares;
              min=proposals[0].min;
              proposals.shift();
            }else {
              matrix=a;
              return matrix;
            }
            
          }
        }
      }  

    }
    
  return false;  
}

function tryProposal(i, j, x, matrix, min, rows, columns, squares, proposals){
  if (min.length<1) return matrix;
  matrix[i][j]=x;
  let sqIndex=Math.floor(i/3)*3+Math.floor(j/3);
  rows[i].splice(rows[i].indexOf(x),1);
  columns[j].splice(columns[j].indexOf(x),1);
  squares[sqIndex].splice(squares[sqIndex].indexOf(x),1);
  replace(min, i, "row");
  replace(min, j, "column");
  replace(min, sqIndex, "square");
  if (min.length<1) return matrix;
  for( let k=0;k<9;k++){
    if (matrix[i][k]==0) {
      if (check(matrix, i, k, rows, columns,squares,min)==false) return false;
    }
    if (matrix[k][j]==0) {
      if(check(matrix, k, j, rows, columns,squares,min)==false) return false;
    }  
  }
  for (let k=Math.floor(i/3)*3;k<Math.floor(i/3)*3+3;k++){
    for (let l=Math.floor(j/3)*3;l<Math.floor(j/3)*3+3;l++){
      if (matrix[k][l]==0) {
        if(check(matrix, k, l, rows, columns,squares,min)==false) return false;
      }
    }
  }
  if (min.length<1)return matrix;
  return propose(matrix, min, rows, columns, squares, proposals);  
}

class area{
   constructor(index, len, type){
     this.index=index;
     this.len=len;
     this.type=type;
   }
}

class proposal{
  constructor(matrix, rows, columns,squares, min){
    this.matrix=[];
    this.rows=[];
    this.columns=[];
    this.min=[];
    this.squares=[]
    for (let i=0; i<9;i++){
      this.matrix[i]=matrix[i].slice();
      this.rows[i]=rows[i].slice();
      this.columns[i]=columns[i].slice();      
      this.squares[i]=squares[i].slice();
    }
    for(let i=0;i<min.length;i++){
      this.min[i]=new area(min[i].index, min[i].len, min[i].type);
    }
    
  }
}