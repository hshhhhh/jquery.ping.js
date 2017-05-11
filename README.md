# jquery.ping.js

Hey! I will add more few lines one day and bower/composer support. I hope.

This is a library for create funny snippet for you website. It allows you to create progress bar with ping emulation.
Of course I coundn't create real ping request from JS so I'm doing HTTP HEAD request. 
You can find [demo](https://hshhhhh.name/) in top-left corner


# shared workers

You asked about it so much in feature requests (ha-ha, nope) and...
Amazing! It possible to use with shared workers to do request from one script and not from each tab.
But it still in development and not ready for production usage bacase requires some pieces of refactoring.

https://github.com/hshhhhh/jquery.ping.js/tree/webworkers

## Put it somewhere in your layout template

```HTML
<div id="ping"></div>
<script src="https://raw.githubusercontent.com/hshhhhh/jquery.ping.js/master/jquery.ping.js"></script>
<script>
// Ping
$(function() {
    $('#ping').ping()
});
</script>
```
