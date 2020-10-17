select count( distinct("postedAtDate") ), "nick" from "Messages"
  where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG'
  group by "nick"
union
select count( distinct("postedAtDate") ), '0total' from "Messages"
  where "channel_id" = %PH:CHANNEL_ID%
  order by nick desc;