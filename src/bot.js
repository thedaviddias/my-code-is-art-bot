console.log('==== #MyCodeIsArt Bot Starting... ====')

const twit = require('twit')

const config = require('./config')
const T = new twit(config.twitterKeys)

// Utility function - Gives unique elements from an array
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

const retweet = () => {
  // Params to be passed to the 'search/tweets' API endpoint
  let params = {
    q: config.twitterConfig.queryString,
    result_type: 'mixed',
  }

  T.get('search/tweets', params, (err, data) => {
    let tweets = data.statuses

    if (!err) {
      let tweetIDList = []
      for (let tweet of tweets) {
        // To avoid duplication of retweets
        if (tweet.text.startsWith('RT @')) {
          // If tweet text starts with "RT @" then it is a retweeted tweet,
          // with a different 'id_str' than the original
          console.log('\nStarts with RT@, adding retweeted status id_str')
          if (tweet.retweeted_status) {
            tweetIDList.push(tweet.retweeted_status.id_str)
          } else {
            tweetIDList.push(tweet.id_str)
          }
        } else {
          tweetIDList.push(tweet.id_str)
        }
      }

      // Get only unique entries
      tweetIDList = tweetIDList.filter(onlyUnique)

      console.log('TweetID LIST = \n' + tweetIDList)

      // Call the 'statuses/retweet/:id' API endpoint for retweeting EACH of the tweetID
      for (let tweetID of tweetIDList) {
        T.post('statuses/retweet/:id', { id: tweetID }, (err_rt) => {
          if (!err_rt) {
            console.log('\n\nRetweeted! ID - ' + tweetID)
          } else {
            console.log('\nError... Duplication maybe... ' + tweetID)
            console.log('Error = ' + err_rt)
          }

          // For debugging
          // console.log("Data = " + data_rt.text)
          // console.log(data_rt)
        })
      }
    } else {
      console.log('Error while searching' + err_search)
      process.exit(1)
    }
  })
}

// Run every 30 minutes
setInterval(() => {
  retweet()
}, 1800000)
