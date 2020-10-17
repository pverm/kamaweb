select extract(hour from "postedAt") as h, count(*) from "Messages" 
where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG'
group by h
order by h;

--    0 - 00:00:00 - 02:59:59
--    1 - 03:00:00 - 05:59:59
--    2 - 06:00:00 - 08:59:59
--    3 - 09:00:00 - 11:59:59
--    4 - 12:00:00 - 14:59:59
--    5 - 15:00:00 - 17:59:59
--    6 - 18:00:00 - 20:59:59
--    7 - 21:00:00 - 23:59:59

--select trunc(extract(hour from "postedAt") / 3) as num, count(*) from "Messages" 
--where "channel_id" = %CHANNEL_ID% and "command" = 'PRIVMSG'
--group by "num";


