select "nick", count(*) as num, "postedAtDate" from "Messages" 
  where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG' and "postedAtDate" >= '2015-06-28'
  group by "postedAtDate", "nick"
union
select '0total', count(*), "postedAtDate" from "Messages"
  where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG' and "postedAtDate" >= '2015-06-28'
  group by "postedAtDate"
  order by "postedAtDate" asc;