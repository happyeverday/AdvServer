class Cluster {
    constructor(index = -1,data = []) {
        this.members = []
        if(index != -1){
            this.members.push(index)
        }
        this.mean = data
    }
    update(membersData){
        // let membersSize = this.members.length
        // let meanSize = this.mean.length
        // for(let i = 0;i < meanSize;i++){
        //     this.mean[i] = 0.0
        // }
        // for(let i = 0;i < meanSize;i++){//每一个单词
        //     for(let j of this.members){//每一个成员
        //         this.mean[i] += membersData[j][i]
        //     }
        // }
        // for(let i = 0;i < meanSize;i++){
        //     this.mean[i] = this.mean[i] / membersSize
        // }
        for(let i = 0;i < this.members.length;i++){
            let perMember = membersData[this.members[i]]
            for(let j = 0;j < perMember.length;j++){
                this.mean[j] += perMember[j]
            }
            for(let k = 0;k < this.mean.length;k++){
                this.mean[k] /= perMember.length
            }
        }
    }
}

module.exports = Cluster